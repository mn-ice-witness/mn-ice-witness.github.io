# Media Controls Strategy

This document explains the video player controls implementation across the site.

## Overview

The site has two contexts where video is displayed:
1. **Media Gallery** (main page) - Grid of video cards that autoplay on scroll
2. **Incident Lightbox** - Full incident detail view when clicking on an incident

Each context has different control needs.

## Media Gallery Controls

Videos in the gallery are designed for passive browsing:
- **Autoplay on scroll** - Videos play automatically when 40%+ visible
- **Muted by default** - All videos start muted
- **Loop** - Videos loop continuously
- **Single control: Volume toggle** - Users can unmute individual videos

Why minimal controls: The gallery is for quick browsing. Users tap a card to open the full incident view where they get full controls.

## Incident Lightbox Controls

When viewing an incident with video, full controls are provided:

| Control | Icon | Function |
|---------|------|----------|
| Play/Pause | ▶️/⏸️ | Toggle video playback |
| Restart | ↻ | Reset video to beginning and play |
| Sound | 🔊/🔇 | Toggle mute/unmute |
| Fullscreen | ⛶ | Enter/exit fullscreen mode |

### Control Bar Location
Controls appear in a semi-transparent bar at bottom-right of the video container.

### Video Behavior
- Autoplays on open (muted)
- Clicking the video toggles play/pause
- When video ends: grayscale filter applied, "scroll for sources below" overlay shown
- Restart button clears the ended state

## Fullscreen Implementation

### The Problem
When fullscreening a `<video>` element directly, mobile browsers (especially on Android) auto-rotate to landscape orientation, even if the user is holding their phone in portrait.

### The Solution
Instead of fullscreening the video element, we fullscreen the container `<div>`:

```javascript
const container = video.closest('.local-media-container');
const target = container || video;
target.requestFullscreen({ navigationUI: 'hide' });
```

This prevents auto-rotation while still allowing manual rotation.

### Fullscreen CSS
The container needs styles for fullscreen mode:

```css
.local-media-container:fullscreen,
.local-media-container:-webkit-full-screen {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.local-media-container:fullscreen .local-media-video,
.local-media-container:-webkit-full-screen .local-media-video {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}
```

### Browser Compatibility
- Standard Fullscreen API: `requestFullscreen()`, `exitFullscreen()`
- WebKit prefix for Safari: `webkitRequestFullscreen()`, `webkitExitFullscreen()`
- iOS Safari native: `webkitEnterFullscreen()` (fallback for video element)

## Files

- `docs/js/lightbox.js` - `setupMediaControls()` and `renderVideoElement()`
- `docs/js/app.js` - `renderMediaCard()` and `setupScrollToPlay()`
- `docs/css/style.css` - `.media-controls`, `.media-control-btn`, fullscreen styles
