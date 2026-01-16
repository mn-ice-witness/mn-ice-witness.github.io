# Single-Page Navigation

This document explains how URL hash navigation works in this single-page application.

## Overview

The site uses hash-based navigation (`#section`) to handle:
- View switching (media vs list)
- Section deep links (e.g., `#schools`)
- Incident deep links (e.g., `#2026-01-13-lyn-lake-tear-gas`)
- About page (`#about`)

## Hash Types

### View Hashes
| Hash | Behavior |
|------|----------|
| (empty) | Media gallery view |
| `#media` | Media gallery view |
| `#list` | List view, scrolled to top |

### Section Hashes
These switch to list view AND scroll to the section:
- `#citizens`
- `#observers`
- `#immigrants`
- `#schools`
- `#response`

Defined in `App.sectionHashes` array for consistent handling.

### Incident Hashes
Any hash matching an incident slug (e.g., `#2026-01-13-lyn-lake-tear-gas`) opens that incident in the lightbox.

### Special Hashes
- `#about` - Opens the about page in lightbox

## Code Architecture

### Canonical Section List
Section hashes are defined once in `app.js`:
```javascript
sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response']
```

Both `app.js` and `lightbox.js` reference `App.sectionHashes` to ensure consistency.

### Key Functions in app.js

**`loadViewFromUrl()`** - Called on init, sets `currentView` based on hash:
- `#list` or section hash → list view
- Empty hash → check localStorage for preference

**`applyInitialView()`** - Applies the view and scrolls to section if needed:
- Calls `switchView()` with appropriate flags
- If section hash, calls `scrollToSection()` after a frame

**`openFromHash()`** - Handles hashchange events:
- Empty/media → switch to media view
- `#list` → switch to list view
- Section hash → switch to list view + scroll to section
- `#about` → open about lightbox
- Other → try to find and open incident

**`initSectionNav()`** - Attaches click handlers to nav pills:
- Prevents default anchor behavior
- Switches to list view if needed
- Updates URL with `history.pushState()`
- Scrolls to section

**`scrollToSection(sectionId)`** - Calculates scroll position:
- Gets sticky nav height (34px)
- Gets sticky toggle height (53px)
- Adds 8px buffer
- Scrolls to `section.top - offset`

### Lightbox Integration (lightbox.js)

**`closeLightbox()`** - Preserves list view state:
- Checks if current hash is a list view hash (including sections)
- Uses `App.sectionHashes` for consistency
- Doesn't clear hash if user was in list/section view

## Sticky Elements

Two elements are sticky and affect scroll calculations:
- `.section-nav` - sticky at `top: 0`, z-index 100
- `.view-toggle` - sticky at `top: 0` (media) or `top: 30px` (list), z-index 99

The site header is NOT sticky - it scrolls away.

## Navigation Flow Examples

### User clicks nav pill "#schools"
1. `initSectionNav` click handler fires
2. `e.preventDefault()` stops default scroll
3. If in media view, `switchView('list', true)` shows list
4. `history.pushState()` updates URL to `#schools`
5. `scrollToSection('schools')` scrolls after next frame

### Page loads with "#schools"
1. `loadViewFromUrl()` sees section hash, sets `currentView = 'list'`
2. `applyInitialView()` calls `switchView('list', true)`
3. `applyInitialView()` calls `scrollToSection('schools')`

### User closes lightbox from "#schools" context
1. `close()` calls `history.back()`
2. Browser pops back to `#schools`
3. `closeLightbox()` sees it's a list view hash
4. URL preserved, user stays in list view at schools section

## Adding New Sections

To add a new section:
1. Add the section ID to `App.sectionHashes` array
2. Add the HTML section with matching `id` attribute
3. Add nav pill with `href="#sectionid"`
4. The scroll calculation handles it automatically
