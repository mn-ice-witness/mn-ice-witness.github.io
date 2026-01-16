# Architecture Overview

## Purpose

MN ICE Files is a static documentation website that tracks civil rights incidents involving ICE and CBP in Minnesota during Operation Metro Surge (December 2025 - present).

## Design Goals

1. **Factual & Credible** - Multiple sources, neutral language, include official responses
2. **Mobile-First** - Optimized for phones, works on desktop
3. **Fast Loading** - Static files, no backend, Cloudflare Pages hosting
4. **Easy to Update** - Add incidents via markdown files
5. **Immersive** - Videos, images, sources at fingertips

## Technology Stack

- **Hosting**: Cloudflare Pages (from `docs/` folder)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Content**: Markdown files parsed client-side
- **Markdown Parser**: marked.js (CDN)
- **No build step required**

## File Structure

```
GIT_MN_ICE_FILES/
├── CONTEXT.md              # AI assistant instructions
├── dev-docs/               # Developer documentation (this folder)
│   ├── architecture.md     # This file
│   ├── incident-schema.md  # Markdown frontmatter schema
│   ├── adding-incidents.md # How to add new incidents
│   └── research-sources.md # Where to find/verify incidents
├── bin/
│   └── run-server.sh       # Local dev server script
└── docs/                   # Website content (ALL content here)
    ├── index.html          # Main entry point
    ├── css/style.css       # Styles
    ├── js/
    │   ├── app.js          # Main app, loads incidents
    │   ├── parser.js       # Parses markdown frontmatter
    │   └── lightbox.js     # Detail popup
    └── incidents/          # ALL incident markdown files (ONLY location!)
        ├── 2025-12/        # December 2025
        └── 2026-01/        # January 2026
```

**IMPORTANT:** All incident files MUST be in `docs/incidents/`. The website serves directly from the `docs/` folder.

## Data Flow

1. `index.html` loads, includes marked.js from CDN
2. `app.js` initializes, reads `incidentFiles` array
3. For each file, fetches markdown from `docs/incidents/` folder
4. `parser.js` extracts frontmatter (YAML between `---`) and body
5. Incidents grouped by `type` and rendered into sections
6. Click on card → `lightbox.js` opens detail view with full markdown

## Incident Types

| Type | Section | Color |
|------|---------|-------|
| `fatal-shooting` | Fatal Incidents | Red |
| `citizen-detained` | U.S. Citizens Detained | Purple |
| `bystander-arrested` | Bystanders & Observers | Blue |
| `community-member-detained` | Community Members | Cyan |
| `school-incident` | School Incidents | Orange |
| `workplace-raid` | Workplace Incidents | Indigo |

## Trustworthiness Ratings

| Level | Criteria | Color |
|-------|----------|-------|
| `high` | 3+ sources, video/photo evidence | Green |
| `medium` | 2 sources or official statements | Yellow |
| `low` | Single source or social media only | Red |
| `unverified` | Reported but not confirmed | Gray |

## Key Files

### `docs/js/app.js`
- Contains `incidentFiles` array listing all markdown files
- **Must be updated** when adding new incidents
- Handles rendering and filtering

### `docs/js/parser.js`
- Parses YAML frontmatter from markdown
- Extracts title, summary from body
- Provides formatting helpers

### `docs/js/lightbox.js`
- Modal popup for full incident details
- Embeds YouTube videos automatically
- Renders markdown to HTML
