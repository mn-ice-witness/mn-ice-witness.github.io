# Media Production Workflow

This document describes how to capture, process, and serve media for MN ICE Files.

## Directory Structure

```
raw_media/           # Source files (gitignored, local only)
  └── YYYY-MM-DD-incident-slug.raw.mov
  └── YYYY-MM-DD-incident-slug.jpg

docs/media/          # Processed files (served to website)
  └── YYYY-MM-DD-incident-slug.mp4    # Compressed, muted video
  └── YYYY-MM-DD-incident-slug.webp   # Optimized image
```

## Naming Convention

Media files MUST start with the incident date-slug to link to incidents:
- `2026-01-11-observer-shoved-into-traffic.raw.mov` → links to incident `2026-01-11-observer-shoved-into-traffic.md`

## Capturing Screen Video

### macOS Built-in (Cmd + Shift + 5)
1. Press `Cmd + Shift + 5`
2. Click "Record Selected Portion"
3. Drag to select the video area
4. Click Record
5. Play the source video
6. Click Stop when done
7. File saves to Desktop as `.mov`

### Recommended: Kap (lightweight)
```bash
brew install --cask kap
```
- Click menu bar icon → drag to select area → record → export as MP4

## Processing Media

### Prerequisites
```bash
brew install ffmpeg
pip3 install pillow
```

### Process All Media
Run from project root:
```bash
python3 scripts/process_media.py
```

This script:
1. Scans `raw_media/` for source files
2. Checks if processed version exists in `docs/media/`
3. If missing or older, processes the file:
   - **Videos**: Strips audio, compresses with H.264, outputs `.mp4`
   - **Images**: Converts to WebP with quality optimization

### Manual Processing

**Video (strip audio + compress)**:
```bash
ffmpeg -i raw_media/file.mov -an -vcodec libx264 -crf 28 -preset medium docs/media/file.mp4
```

**Image (convert to WebP)**:
```bash
ffmpeg -i raw_media/file.jpg -quality 80 docs/media/file.webp
```

## Video Specifications

Target specs for web delivery:
- **Format**: MP4 (H.264)
- **Audio**: None (muted)
- **CRF**: 28 (balance of quality/size)
- **Resolution**: Source resolution (no scaling)
- **Max duration**: ~30 seconds recommended

## Image Specifications

- **Format**: WebP (with JPG fallback)
- **Quality**: 80%
- **Max width**: 1200px (scaled down if larger)

## Adding Media to Incidents

Once processed, media auto-displays in the incident lightbox if:
1. File exists in `docs/media/`
2. Filename matches incident slug pattern

The JSON summary includes `hasLocalMedia: true` for incidents with media.

## Workflow Summary

1. **Capture**: Screen record the compelling video
2. **Rename**: `YYYY-MM-DD-incident-slug.raw.mov`
3. **Place**: Move to `raw_media/`
4. **Process**: Run `python3 scripts/process_media.py`
5. **Verify**: Media appears in incident lightbox
6. **Commit**: Only `docs/media/` files are tracked in git
