# Media Controls Strategy

This document explains the video player controls implementation across the site.

## Overview

The site has **three distinct contexts** where video is displayed, each with different control needs:

1. **Media Gallery** (main page) - Grid of video cards for passive browsing
2. **Incident Page** (lightbox) - Full incident detail view with sources below
3. **Fullscreen** (from incident page) - Immersive viewing experience

## Mode Comparison

| Feature | Media Gallery | Incident Page | Fullscreen |
|---------|--------------|---------------|------------|
| Autoplay | On scroll (40%+ visible) | On open | Continues |
| Muted by default | Yes | Yes | No (preserves state) |
| Loop | Yes | No | No |
| Play/Pause | No | Yes | Yes |
| Time slider | No | No | **Yes** |
| Restart | No | Yes | Yes (prompt on end) |
| Volume toggle | Yes | Yes | Yes |
| Fullscreen button | No | Yes | Exit button |
| End behavior | Loop | Grayscale + "scroll for sources" | Grayscale + restart prompt |

## Media Gallery Controls

Videos in the gallery are designed for passive browsing:
- **Autoplay on scroll** - Videos play automatically when 40%+ visible
- **Muted by default** - All videos start muted
- **Loop** - Videos loop continuously
- **Single control: Volume toggle** - Users can unmute individual videos

Why minimal controls: The gallery is for quick browsing. Users tap a card to open the full incident view where they get full controls.

## Incident Page Controls (Lightbox)

When viewing an incident with video, controls are provided for focused viewing:

| Control | Icon | Function |
|---------|------|----------|
| Play/Pause | ▶️/⏸️ | Toggle video playback |
| Restart | ↻ | Reset video to beginning and play |
| Sound | 🔊/🔇 | Toggle mute/unmute |
| Fullscreen | ⛶ | Enter fullscreen mode |

### Control Bar Location
Controls appear in a semi-transparent bar at bottom-right of the video container.

### Video End Behavior
- Grayscale filter applied to video
- "Scroll for sources below" overlay appears
- Restart button clears the ended state

This prompts users to read the sources and context below the video.

## Fullscreen Controls

Fullscreen mode provides immersive viewing with additional timeline control:

| Control | Icon | Function |
|---------|------|----------|
| Play/Pause | ▶️/⏸️ | Toggle video playback |
| Time slider | ━━━○━━━ | Seek to any point in video |
| Restart | ↻ | Reset video to beginning and play |
| Sound | 🔊/🔇 | Toggle mute/unmute |
| Exit fullscreen | ⛶ | Exit fullscreen mode |

### Video End Behavior (Fullscreen)
- Grayscale filter applied to video
- **Restart prompt** appears (NOT "scroll for sources" - that doesn't apply in fullscreen)
- Clicking restart or the prompt restarts the video

### Why Time Slider Only in Fullscreen
- Incident page videos are meant for quick viewing with sources below
- Fullscreen implies user wants deeper engagement with the video content
- Time slider enables rewatching specific moments

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
