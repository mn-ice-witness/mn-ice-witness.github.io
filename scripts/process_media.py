#!/usr/bin/env python3
"""
Process raw media files for web delivery.
- Videos: Compress with H.264, normalize audio (EBU R128)
- Images: Convert to optimized JPEG

Supports multi-part videos with `:01`, `:02` suffixes - concatenates them in order.

Compares timestamps between raw_media/ and docs/media/ to process only new/updated files.
Use --force to reprocess all files regardless of timestamps.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import tempfile
from pathlib import Path


# Video extensions to process
VIDEO_EXTENSIONS = {".mov", ".mp4", ".avi", ".mkv", ".webm", ".m4v", ".mv"}

# Pattern to match multi-part files: base:01.raw.mov, base:02.raw.mov, etc.
MULTIPART_PATTERN = re.compile(r"^(.+):(\d+)(\.raw)?$")

# Image extensions to process
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}


def parse_multipart_filename(path: Path) -> tuple[str, int] | None:
    """Parse a multi-part filename like 'base:01.raw.mov' -> ('base', 1) or None if not multi-part."""
    stem = path.stem
    match = MULTIPART_PATTERN.match(stem)
    if match:
        base = match.group(1)
        part_num = int(match.group(2))
        return (base, part_num)
    return None


def group_multipart_files(
    raw_files: list[Path],
) -> tuple[dict[str, list[Path]], list[Path]]:
    """
    Group multi-part files by base name, return singles separately.
    Returns: (multipart_groups, single_files)
    """
    groups: dict[str, list[tuple[int, Path]]] = {}
    singles: list[Path] = []

    for path in raw_files:
        parsed = parse_multipart_filename(path)
        if parsed:
            base, part_num = parsed
            key = f"{base}{path.suffix}"
            if key not in groups:
                groups[key] = []
            groups[key].append((part_num, path))
        else:
            singles.append(path)

    sorted_groups: dict[str, list[Path]] = {}
    for key, parts in groups.items():
        parts.sort(key=lambda x: x[0])
        sorted_groups[key] = [p[1] for p in parts]

    return sorted_groups, singles


def validate_multipart_sequence(base_name: str, parts: list[Path]) -> list[str]:
    """Validate a multi-part sequence is complete. Returns list of error messages."""
    errors = []
    part_numbers = []

    for path in parts:
        parsed = parse_multipart_filename(path)
        if parsed:
            part_numbers.append(parsed[1])

    part_numbers.sort()

    if part_numbers[0] != 1:
        errors.append(
            f"  {base_name}: Sequence must start at :01, found :{part_numbers[0]:02d}"
        )

    expected = list(range(1, len(part_numbers) + 1))
    if part_numbers != expected:
        missing = set(expected) - set(part_numbers)
        if missing:
            errors.append(
                f"  {base_name}: Missing parts: {', '.join(f':{n:02d}' for n in sorted(missing))}"
            )

    return errors


def get_video_dimensions(path: Path) -> tuple[int, int]:
    """Get video width and height using ffprobe."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        str(path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    width, height = result.stdout.strip().split(",")
    return int(width), int(height)


def concatenate_videos(input_paths: list[Path], output_path: Path) -> bool:
    """Concatenate videos, using first video's dimensions as canvas, letterboxing others."""
    print(f"  Concatenating {len(input_paths)} parts into: {output_path.name}")

    dimensions = [get_video_dimensions(p) for p in input_paths]
    canvas_width, canvas_height = dimensions[0]
    canvas_width += canvas_width % 2
    canvas_height += canvas_height % 2

    for i, (path, (w, h)) in enumerate(zip(input_paths, dimensions)):
        print(f"    Part {i + 1}: {path.name} ({w}x{h})")
    print(f"    Target canvas (from part 1): {canvas_width}x{canvas_height}")

    inputs = []
    for path in input_paths:
        inputs.extend(["-i", str(path)])

    filter_parts = []
    for i in range(len(input_paths)):
        filter_parts.append(
            f"[{i}:v]scale={canvas_width}:{canvas_height}:force_original_aspect_ratio=decrease,"
            f"pad={canvas_width}:{canvas_height}:(ow-iw)/2:(oh-ih)/2:black[v{i}]"
        )

    concat_inputs = "".join(f"[v{i}][{i}:a]" for i in range(len(input_paths)))
    filter_parts.append(
        f"{concat_inputs}concat=n={len(input_paths)}:v=1:a=1[outv][outa]"
    )

    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        filter_complex,
        "-map",
        "[outv]",
        "-map",
        "[outa]",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "18",
        "-c:a",
        "aac",
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Concat error: {result.stderr[:500]}")
            return False
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def get_output_path(raw_path: Path, output_dir: Path) -> Path:
    """Convert raw filename to output filename."""
    stem = raw_path.stem
    # Remove .raw suffix if present
    if stem.endswith(".raw"):
        stem = stem[:-4]

    # Determine output extension based on input type
    suffix = raw_path.suffix.lower()
    if suffix in VIDEO_EXTENSIONS:
        return output_dir / f"{stem}.mp4"
    elif suffix in IMAGE_EXTENSIONS:
        return output_dir / f"{stem}.jpg"  # Use JPEG for compatibility
    return None


def get_multipart_output_path(base_name: str, output_dir: Path) -> Path:
    """Get output path for a multi-part video group (base name without :NN suffix)."""
    stem = base_name
    if stem.endswith(".raw"):
        stem = stem[:-4]
    # Remove the extension from the key (it was added for grouping)
    for ext in VIDEO_EXTENSIONS:
        if stem.endswith(ext):
            stem = stem[: -len(ext)]
            break
    return output_dir / f"{stem}.mp4"


def needs_processing(raw_path: Path, output_path: Path) -> bool:
    """Check if file needs processing (missing or outdated)."""
    if not output_path.exists():
        return True
    return raw_path.stat().st_mtime > output_path.stat().st_mtime


def multipart_needs_processing(parts: list[Path], output_path: Path) -> bool:
    """Check if any part of a multi-part group is newer than output."""
    if not output_path.exists():
        return True
    output_mtime = output_path.stat().st_mtime
    return any(p.stat().st_mtime > output_mtime for p in parts)


def process_video(input_path: Path, output_path: Path) -> bool:
    """Process video: compress with H.264, normalize audio, crop edges, optimize for web."""
    print(f"  Processing video: {input_path.name}")

    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output
        "-i",
        str(input_path),
        "-vcodec",
        "libx264",
        "-crf",
        "35",  # Quality (higher = smaller, 35 balances size/quality)
        "-preset",
        "slow",  # Better compression
        "-vf",
        "crop=iw-16:ih-16:8:8,scale=-2:min(720\\,ih),fps=30",  # Crop 8px edges, max 720p height, 30fps
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11",  # EBU R128 audio normalization
        "-c:a",
        "aac",  # AAC audio codec
        "-b:a",
        "128k",  # Audio bitrate
        "-movflags",
        "+faststart",  # Web optimization
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        # Report compression
        input_size = input_path.stat().st_size / (1024 * 1024)
        output_size = output_path.stat().st_size / (1024 * 1024)
        ratio = (1 - output_size / input_size) * 100
        print(
            f"    Compressed: {input_size:.1f}MB -> {output_size:.1f}MB ({ratio:.0f}% reduction)"
        )
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def process_image(input_path: Path, output_path: Path) -> bool:
    """Process image: convert to optimized JPEG."""
    print(f"  Processing image: {input_path.name}")

    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output
        "-i",
        str(input_path),
        "-vf",
        "scale=min(1200\\,iw):-1",  # Max width 1200, maintain aspect
        "-q:v",
        "3",  # JPEG quality (2-31, lower is better)
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        input_size = input_path.stat().st_size / 1024
        output_size = output_path.stat().st_size / 1024
        print(f"    Optimized: {input_size:.0f}KB -> {output_size:.0f}KB")
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def process_multipart_video(
    base_name: str, parts: list[Path], output_dir: Path, force: bool
) -> tuple[int, int, int]:
    """Process a multi-part video: concatenate parts, then compress."""
    output_path = get_multipart_output_path(base_name, output_dir)

    if not force and not multipart_needs_processing(parts, output_path):
        part_names = ", ".join(p.name for p in parts)
        print(f"  Skipping (up to date): {part_names}")
        return (0, 1, 0)

    print(f"  Multi-part video: {base_name}")
    for i, p in enumerate(parts, 1):
        print(f"    Part {i}: {p.name}")

    with tempfile.NamedTemporaryFile(suffix=".mov", delete=False) as tmp:
        concat_path = Path(tmp.name)

    if not concatenate_videos(parts, concat_path):
        concat_path.unlink(missing_ok=True)
        return (0, 0, 1)

    success = process_video(concat_path, output_path)
    concat_path.unlink(missing_ok=True)

    if success:
        return (1, 0, 0)
    return (0, 0, 1)


def main():
    parser = argparse.ArgumentParser(
        description="Process raw media files for web delivery"
    )
    parser.add_argument(
        "--force", action="store_true", help="Reprocess all files, ignoring timestamps"
    )
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    raw_dir = project_root / "raw_media"
    output_dir = project_root / "docs" / "media"

    output_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        print(f"No raw_media directory found at {raw_dir}")
        print("Create it and add media files to process.")
        return

    all_extensions = VIDEO_EXTENSIONS | IMAGE_EXTENSIONS
    raw_files = [
        f
        for f in raw_dir.iterdir()
        if f.is_file()
        and f.suffix.lower() in all_extensions
        and not f.name.startswith("Screen")
    ]

    if not raw_files:
        print("No media files found in raw_media/")
        return

    multipart_groups, single_files = group_multipart_files(raw_files)

    validation_errors = []
    for base_name, parts in multipart_groups.items():
        errs = validate_multipart_sequence(base_name, parts)
        validation_errors.extend(errs)

    if validation_errors:
        print("Multi-part sequence validation errors:")
        for err in validation_errors:
            print(err)
        print("\nFix these issues before processing.")
        return

    total_items = len(multipart_groups) + len(single_files)
    print(f"Found {len(raw_files)} media files in raw_media/")
    if multipart_groups:
        print(f"  {len(multipart_groups)} multi-part video(s)")
    print(f"  {len(single_files)} single file(s)")
    if args.force:
        print("Force mode: reprocessing all files")
    print()

    processed = 0
    skipped = 0
    errors = 0

    for base_name, parts in sorted(multipart_groups.items()):
        p, s, e = process_multipart_video(base_name, parts, output_dir, args.force)
        processed += p
        skipped += s
        errors += e

    for raw_path in sorted(single_files):
        output_path = get_output_path(raw_path, output_dir)
        if output_path is None:
            continue

        if not args.force and not needs_processing(raw_path, output_path):
            print(f"  Skipping (up to date): {raw_path.name}")
            skipped += 1
            continue

        suffix = raw_path.suffix.lower()
        if suffix in VIDEO_EXTENSIONS:
            success = process_video(raw_path, output_path)
        else:
            success = process_image(raw_path, output_path)

        if success:
            processed += 1
        else:
            errors += 1

    print()
    print(f"Done: {processed} processed, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    main()
