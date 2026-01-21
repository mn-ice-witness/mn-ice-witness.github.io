# UI Patterns

Reusable patterns and conventions for the site's user interface.

## SVG Icons — DRY Pattern (IMPORTANT)

**NEVER inline SVG paths directly.** Always use the symbol/use pattern for icons.

### Why

- **DRY (Don't Repeat Yourself)** — Define once, use everywhere
- **Maintainable** — Change an icon in one place, updates everywhere
- **Smaller HTML** — References are tiny vs. full path data
- **Consistent** — All icons come from the same source

### How It Works

1. **Define icons once** in `docs/index.html` inside the hidden `<svg>` block
2. **Reference them** anywhere with `<use href="#icon-name"/>`

### Adding a New Icon

1. Add a `<symbol>` to the icon block in `docs/index.html`:
```html
<svg style="display:none">
  <!-- existing icons... -->
  <symbol id="icon-yourname" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
</svg>
```

2. Use it anywhere:
```html
<svg width="16" height="16"><use href="#icon-yourname"/></svg>
```

3. Document it in the table below

### DON'T Do This

```html
<!-- BAD: Inline SVG repeated everywhere -->
<svg viewBox="0 0 24 24" width="16" height="16">
  <path d="M8 5v14l11-7z" fill="currentColor"/>
</svg>
```

### DO This Instead

```html
<!-- GOOD: Reference the symbol -->
<svg width="16" height="16"><use href="#icon-play"/></svg>
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
<h2 id="section-name">Section Title <a href="#section-name" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>
```

### Example Usage

See `docs/about.md` for a complete implementation with anchored section headers (h2 level only).

## Available Icons

All icons are defined in `docs/index.html`. Reference with `<use href="#icon-name"/>`.

| Symbol ID | Description | Used For |
|-----------|-------------|----------|
| `icon-camera` | Camera outline | Media indicator on list items |
| `icon-eye` | Eye | Viewed indicator |
| `icon-link` | Chain link | Copy link / share buttons |
| `icon-play` | Play triangle | Video play button |
| `icon-pause` | Pause bars | Video pause button |
| `icon-restart` | Circular arrow | Video restart button |
| `icon-speaker` | Speaker with waves | Volume on |
| `icon-mute-x` | Speaker with X | Volume muted |
| `icon-fullscreen-enter` | Expanding corners | Enter fullscreen |
| `icon-fullscreen-exit` | Contracting corners | Exit fullscreen |
| `icon-trust` | Shield with check | Trustworthiness indicator |
| `icon-search` | Magnifying glass | Search button |

When adding new icons, add them to `docs/index.html` and document here.
