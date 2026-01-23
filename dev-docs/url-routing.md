# URL Routing Architecture

This document explains the URL routing system used by MN ICE Witness, including path-based URLs for social media sharing and backwards compatibility with legacy hash URLs.

## Overview

The site uses **clean path-based URLs** that work well for:
- Social media sharing (proper Open Graph meta tags)
- Link previews on Twitter/X, Facebook, Bluesky, etc.
- SEO and bookmarking
- Professional, readable URLs

## URL Structure

| Content | URL Pattern | Example |
|---------|-------------|---------|
| Home (media view) | `/` | `mn-ice-witness.org/` |
| Incident | `/entry/<slug>` | `mn-ice-witness.org/entry/2026-01-20-trump-mistakes-happen` |
| About page | `/about` | `mn-ice-witness.org/about` |
| About section | `/about/<section>` | `mn-ice-witness.org/about/sources-used` |
| List view | `/list` | `mn-ice-witness.org/list` |
| List category | `/list/<category>` | `mn-ice-witness.org/list/citizens` |
| New & Updated | `/new-updated/<date>` | `mn-ice-witness.org/new-updated/01-20-2026` |

### Filter Parameter

The `?filter=new` query parameter can be added to any URL to enable the "NEW/UPDATED" checkbox:

| URL | Behavior |
|-----|----------|
| `/?filter=new` | Media view with NEW/UPDATED filter enabled |
| `/list?filter=new` | List view with NEW/UPDATED filter enabled |

When the user toggles the NEW/UPDATED checkbox:
- Checking it adds `?filter=new` to the URL
- Unchecking it removes the parameter

This allows sharing links with the filter pre-enabled.

## How It Works

### Cloudflare Pages Functions

Path-based URLs require server-side handling. Cloudflare Pages Functions intercept requests and:

1. **Inject Open Graph meta tags** - Social media crawlers see incident-specific titles, descriptions, and images
2. **Return index.html** - The same single-page app loads, but with customized meta tags
3. **Let JavaScript take over** - The app reads the URL path and displays the appropriate content

```
functions/                      # At project root, not in docs/
├── entry/
│   └── [slug].js              # Handles /entry/<slug>
├── about/
│   └── [[path]].js            # Handles /about and /about/<section>
├── list/
│   └── [[category]].js        # Handles /list and /list/<category>
└── new-updated/
    └── [date].js              # Handles /new-updated/<MM-DD-YYYY>
docs/
├── index.html
└── ...
```

### JavaScript Routing

The app uses the History API for navigation:

- `App.buildUrl(type, slug)` - Builds path URLs
- `App.parseUrl()` - Parses current URL into route info
- `history.pushState()` - Updates URL without page reload

When a user clicks an incident, the URL changes to `/incident/slug` and the lightbox opens.

### Backwards Compatibility

Legacy hash URLs (`/#slug`, `/#about`, etc.) still work:

1. `App.parseUrl()` checks for hash if no path match
2. `App.upgradeLegacyUrl()` redirects hash URLs to clean path URLs
3. Old bookmarks and shared links continue to work

## Local Development

**Important:** Path-based URLs require the Cloudflare Functions to work.

```bash
# Recommended: Full functionality including Functions
./bin/run-server.sh

# Fallback: Simple Python server (path URLs won't work)
./bin/run-server.sh --simple
```

The default mode uses Wrangler to emulate Cloudflare Pages locally, giving you identical behavior to production.

### Requirements

- Node.js (for `npx wrangler`)
- First run will auto-install wrangler via npx

## Social Media Sharing

When someone shares a link like `mn-ice-witness.org/incident/2026-01-20-trump-mistakes-happen`:

1. Social media crawler requests the URL
2. Cloudflare Function intercepts, looks up the incident
3. Function injects specific Open Graph tags:
   ```html
   <meta property="og:title" content="Trump on ICE Violence: 'Mistakes Happen'... | MN ICE Witness">
   <meta property="og:description" content="At a White House briefing...">
   <meta property="og:image" content="https://mn-ice-witness.org/assets/og-image.jpg">
   ```
4. Crawler sees the customized meta tags
5. Link preview shows incident-specific info

### og:image Sources

The Function selects og:image in this order:
1. Incident's `.jpg` image (if available)
2. Video thumbnail (when implemented)
3. Site default `assets/og-image.jpg`

## Copy Link Behavior

When users click "Copy Link" in the lightbox:
- Incidents: Copies `/incident/<slug>` URL
- About pages: Copies `/about` or `/about/<section>` URL
- The copied URL will generate proper social media previews

## Files Changed

This routing system touches:

| File | Purpose |
|------|---------|
| `functions/entry/[slug].js` | OG tags for incidents |
| `functions/about/[[path]].js` | OG tags for about pages |
| `functions/list/[[category]].js` | OG tags for list views |
| `functions/new-updated/[date].js` | OG tags for new-updated pages |
| `docs/js/router.js` | URL parsing, building |
| `docs/js/app.js` | Route handling |
| `docs/js/lightbox.js` | URL updates when opening/closing |
| `bin/run-server.sh` | Wrangler for local dev |

## Inter-Incident Links

Incident markdown files can link to other incidents using path URLs:

```markdown
See: [DHS Response](/entry/2026-01-18-dhs-response-juan-carlos)
```

`setupIncidentLinks()` in `lightbox.js` intercepts these clicks and opens the linked incident in the same lightbox via `openIncidentBySlug()`. This:
- Saves scroll position of the current incident
- Pushes new history state for the linked incident
- Allows back-button to return to the previous incident with scroll restored

**Both link formats work:**
- Path links: `/entry/slug` (preferred for new content)
- Hash links: `#slug` (legacy, still supported)

## Testing

1. Start local server: `./bin/run-server.sh`
2. Open `http://localhost:8000`
3. Click an incident - URL should change to `/entry/slug`
4. Copy link - should copy the `/entry/slug` URL
5. Paste that URL directly - should open the incident
6. Test legacy URLs like `/#slug` - should redirect to clean URL
7. **Test inter-incident links:** Open an incident that links to another (e.g., Juan Carlos → DHS Response), close the second, verify back-button returns to first with scroll preserved

## Troubleshooting

### Path URLs return 404 locally
Make sure you're using `./bin/run-server.sh` (not the `--simple` flag). Path URLs require Wrangler.

### Functions not updating
Wrangler caches Functions. Try restarting the dev server.

### Social previews not showing
1. Use a URL debugger (Twitter Card Validator, Facebook Sharing Debugger)
2. Check that the Function is returning the right meta tags
3. Some platforms cache aggressively - may need to wait or use cache-busting
