#!/usr/bin/env python3
"""
Process raw media files for web delivery.
- Videos: Strip audio, compress with H.264
- Images: Convert to WebP with optimization

Compares timestamps between raw_media/ and docs/media/ to process only new/updated files.
"""

import subprocess
import sys
from pathlib import Path


# Video extensions to process
VIDEO_EXTENSIONS = {'.mov', '.mp4', '.avi', '.mkv', '.webm', '.m4v', '.mv'}

# Image extensions to process
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}


def get_output_path(raw_path: Path, output_dir: Path) -> Path:
    """Convert raw filename to output filename."""
    stem = raw_path.stem
    # Remove .raw suffix if present
    if stem.endswith('.raw'):
        stem = stem[:-4]

    # Determine output extension based on input type
    suffix = raw_path.suffix.lower()
    if suffix in VIDEO_EXTENSIONS:
        return output_dir / f"{stem}.mp4"
    elif suffix in IMAGE_EXTENSIONS:
        return output_dir / f"{stem}.jpg"  # Use JPEG for compatibility
    return None


def needs_processing(raw_path: Path, output_path: Path) -> bool:
    """Check if file needs processing (missing or outdated)."""
    if not output_path.exists():
        return True
    return raw_path.stat().st_mtime > output_path.stat().st_mtime


def process_video(input_path: Path, output_path: Path) -> bool:
    """Process video: compress with H.264, crop edges, optimize for web."""
    print(f"  Processing video: {input_path.name}")

    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output
        '-i', str(input_path),
        '-vcodec', 'libx264',
        '-crf', '35',  # Quality (higher = smaller, 35 balances size/quality)
        '-preset', 'slow',  # Better compression
        '-vf', 'crop=iw-16:ih-16:8:8,scale=-2:min(720\\,ih),fps=30',  # Crop 8px edges, max 720p height, 30fps
        '-movflags', '+faststart',  # Web optimization
        str(output_path)
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
        print(f"    Compressed: {input_size:.1f}MB -> {output_size:.1f}MB ({ratio:.0f}% reduction)")
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def process_image(input_path: Path, output_path: Path) -> bool:
    """Process image: convert to optimized JPEG."""
    print(f"  Processing image: {input_path.name}")

    cmd = [
        'ffmpeg',
        '-y',  # Overwrite output
        '-i', str(input_path),
        '-vf', 'scale=min(1200\\,iw):-1',  # Max width 1200, maintain aspect
        '-q:v', '3',  # JPEG quality (2-31, lower is better)
        str(output_path)
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


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    raw_dir = project_root / 'raw_media'
    output_dir = project_root / 'docs' / 'media'

    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        print(f"No raw_media directory found at {raw_dir}")
        print("Create it and add media files to process.")
        return

    # Gather all media files
    all_extensions = VIDEO_EXTENSIONS | IMAGE_EXTENSIONS
    raw_files = [f for f in raw_dir.iterdir()
                 if f.is_file() and f.suffix.lower() in all_extensions]

    if not raw_files:
        print("No media files found in raw_media/")
        return

    print(f"Found {len(raw_files)} media files in raw_media/")
    print()

    processed = 0
    skipped = 0
    errors = 0

    for raw_path in sorted(raw_files):
        output_path = get_output_path(raw_path, output_dir)
        if output_path is None:
            continue

        if not needs_processing(raw_path, output_path):
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


if __name__ == '__main__':
    main()
