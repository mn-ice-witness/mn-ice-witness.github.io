# UI Patterns

Reusable patterns and conventions for the site's user interface.

## SVG Icon Reuse Pattern

When using the same SVG icon multiple times on a page, define it once as a `<symbol>` and reference it with `<use>`. This keeps code clean and maintainable.

### Pattern

```html
<!-- Define icons once (hidden) -->
<svg style="display:none">
  <symbol id="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </symbol>
</svg>

<!-- Reuse anywhere -->
<svg width="16" height="16"><use href="#link-icon"/></svg>
```

### Copy-to-Clipboard with Feedback

Header anchor links are handled via event delegation in `lightbox.js` (not inline onclick).

**CSS** (in `docs/css/style.css`):
```css
.header-link { color: #ccc !important; text-decoration: none !important; ... }
.header-link:hover { color: #7ba3c9 !important; }
.header-link.copied { color: #1a7f37 !important; }
```

**Event delegation** (in `lightbox.js` renderAboutContent):
- Attaches click listeners to all `.header-link` elements
- Copies URL to clipboard
- Updates browser URL via `history.replaceState`
- Adds `.copied` class briefly for visual feedback

**Routing** (in `app.js`):
- About page section anchors are defined in `App.aboutHashes` array
- `handleInitialHash` and `openFromHash` route these to `Lightbox.openAbout(anchor)`
- Scroll listener updates URL as user scrolls between sections

**HTML usage** (in `about.md`):
```html
<h2 id="section-name">Section Title <a href="#section-name" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#link-icon"/></svg></a></h2>
```

### Example Usage

See `docs/about.md` for a complete implementation with anchored section headers (h2 level only).

## Standard Icons

Icons used throughout the site (from lightbox.js and elsewhere):

| Icon | Symbol ID | Use |
|------|-----------|-----|
| Chain link | `link-icon` | Copy link / share |

When adding new icons, define them in the hidden `<svg>` block and document here.
