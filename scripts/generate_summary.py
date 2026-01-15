#!/usr/bin/env python3
"""
Generate incidents-summary.json from markdown incident files.
This creates a single JSON file with all metadata needed for table rendering,
eliminating the need to fetch individual markdown files on page load.
"""

import json
import re
from pathlib import Path


# Media extensions for detecting local media
VIDEO_EXTENSIONS = {'.mp4', '.webm'}
IMAGE_EXTENSIONS = {'.webp', '.jpg', '.jpeg', '.png'}


def get_local_media(slug: str, media_dir: Path) -> dict:
    """Check for local media files matching the incident slug."""
    result = {'hasLocalMedia': False, 'localMediaType': None, 'localMediaPath': None}

    if not media_dir.exists():
        return result

    # Look for video first, then image
    for ext in VIDEO_EXTENSIONS:
        media_path = media_dir / f"{slug}{ext}"
        if media_path.exists():
            result['hasLocalMedia'] = True
            result['localMediaType'] = 'video'
            result['localMediaPath'] = f"media/{slug}{ext}"
            return result

    for ext in IMAGE_EXTENSIONS:
        media_path = media_dir / f"{slug}{ext}"
        if media_path.exists():
            result['hasLocalMedia'] = True
            result['localMediaType'] = 'image'
            result['localMediaPath'] = f"media/{slug}{ext}"
            return result

    return result


def parse_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = content[match.end():].strip()

    meta = {}
    for line in frontmatter_text.split('\n'):
        if ':' not in line:
            continue
        key, value = line.split(':', 1)
        meta[key.strip()] = value.strip()

    return meta, body


def extract_title(body):
    match = re.search(r'^# (.+)$', body, re.MULTILINE)
    return match.group(1).strip() if match else 'Untitled Incident'


def extract_summary(body):
    match = re.search(r'## Summary\n+([\s\S]*?)(?=\n## |$)', body)
    if match:
        return match.group(1).strip().split('\n')[0]
    return ''


def parse_type(type_value):
    if ',' in type_value:
        return [t.strip() for t in type_value.split(',')]
    return type_value


def count_media(content):
    videos = len(re.findall(r'\*\*Video:\*\*', content, re.IGNORECASE))
    photos = len(re.findall(r'\*\*Photo:\*\*', content, re.IGNORECASE))
    analysis = len(re.findall(r'\*\*Analysis:\*\*', content, re.IGNORECASE))
    return videos + photos + analysis


def process_incident(file_path, docs_dir, media_dir):
    content = file_path.read_text()
    meta, body = parse_frontmatter(content)

    relative_path = str(file_path.relative_to(docs_dir))

    # Extract slug from filename (without .md)
    slug = file_path.stem

    notable_value = meta.get('notable', 'false').lower()
    is_notable = notable_value in ('true', 'yes', '1')

    # Check for local media
    local_media = get_local_media(slug, media_dir)

    return {
        'filePath': relative_path,
        'title': extract_title(body),
        'summary': extract_summary(body),
        'date': meta.get('date', 'Unknown'),
        'time': meta.get('time', 'unknown'),
        'location': meta.get('location', 'Unknown location'),
        'city': meta.get('city', 'Minneapolis'),
        'type': parse_type(meta.get('type', 'unknown')),
        'status': meta.get('status', 'unknown'),
        'victimCitizenship': meta.get('victim_citizenship', 'unknown'),
        'injuries': meta.get('injuries', 'unknown'),
        'trustworthiness': meta.get('trustworthiness', 'unverified'),
        'lastUpdated': meta.get('last_updated', meta.get('date', 'Unknown')),
        'mediaCount': count_media(content),
        'notable': is_notable,
        'hasLocalMedia': local_media['hasLocalMedia'],
        'localMediaType': local_media['localMediaType'],
        'localMediaPath': local_media['localMediaPath']
    }


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    docs_dir = project_root / 'docs'
    incidents_dir = docs_dir / 'incidents'
    media_dir = docs_dir / 'media'
    output_file = docs_dir / 'data' / 'incidents-summary.json'

    output_file.parent.mkdir(parents=True, exist_ok=True)

    incidents = []
    for md_file in incidents_dir.rglob('*.md'):
        incident = process_incident(md_file, docs_dir, media_dir)
        incidents.append(incident)

    incidents.sort(key=lambda x: x['date'], reverse=True)

    # Count media for summary
    media_count = sum(1 for i in incidents if i['hasLocalMedia'])

    output_file.write_text(json.dumps(incidents, indent=2))

    print(f"Generated {output_file} with {len(incidents)} incidents ({media_count} with local media)")


if __name__ == '__main__':
    main()
