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
- `#new-updated-MM-DD-YYYY` - Opens daily summary lightbox (e.g., `#new-updated-01-18-2026`)

## Code Architecture

### Canonical Section List
Section hashes are defined once in `app.js`:
```javascript
sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response']
```

Both `app.js` and `lightbox.js` reference `App.sectionHashes` to ensure consistency.

### Key Functions in app.js

**`handleInitialHash()`** - Called once on init after incidents load. Handles ALL hash types for initial page load:
- Empty/media → use localStorage preference or default to media view
- `#list` → switch to list view
- Section hash → disable sortByUpdated, switch to list, scroll to section
- `#about` → open about lightbox
- `#new-updated-*` → open daily summary lightbox
- Incident slug → open incident lightbox

**`openFromHash()`** - Handles hashchange events (navigation after initial load):
- Same logic as `handleInitialHash()` but skips if lightbox is already open
- Used for back/forward navigation and in-page hash changes

**`disableSortByUpdated()`** - Helper to disable "New/Updated" toggle:
- Sets `sortByUpdated = false`
- Saves preference to localStorage
- Updates checkbox UI

**`scrollToSectionWithFlag(sectionId)`** - Helper to scroll with scroll listener protection:
- Sets `isScrollingToSection = true` to prevent scroll listener from changing hash
- Scrolls to section
- Resets flag after 1500ms

**`initSectionNav()`** - Attaches click handlers to nav pills:
- Prevents default anchor behavior
- Switches to list view if needed
- Updates URL with `history.pushState()`
- Calls `scrollToSectionWithFlag()`

**`scrollToSection(sectionId)`** - Calculates scroll position:
- Gets sticky nav height (34px)
- Gets sticky toggle height (53px)
- Adds 8px buffer
- Scrolls to `section.top - offset`

### Lightbox Integration (lightbox.js)

**open vs show pattern** - For special lightbox pages (about, new-updated):
- `openX()` - Pushes to history, then renders (used when user clicks link)
- `showX()` - Just renders without pushing (used by handlePopState when going back)

This ensures back button works correctly:
1. User opens `#new-updated-01-18-2026` → `openNewUpdated()` pushes to history
2. User clicks incident → `openIncidentFromNewUpdated()` pushes with `fromNewUpdated` state
3. User closes incident → `history.back()` triggers popstate
4. `handlePopState` sees new-updated slug → calls `showNewUpdated()` (no push)
5. User is back at the daily summary

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
1. `handleInitialHash()` sees section hash
2. Calls `disableSortByUpdated()` to turn off "New/Updated" toggle
3. Calls `switchView('list', true)` to show list view
4. Calls `scrollToSectionWithFlag('schools')` to scroll with protection

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
