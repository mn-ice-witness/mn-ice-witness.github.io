# Media Loading Strategy

This document describes how videos are loaded in the media gallery.

## Current Approach: Native Browser Loading

We use the simplest possible approach - let the browser handle video loading natively.

### How It Works

1. **Videos have `preload="metadata"`** - Browser loads only dimensions/duration initially
2. **Scroll-to-play triggers `video.play()`** - When video is 40% visible
3. **Browser loads video data on demand** - Native buffering and prioritization

```html
<video src="video.mp4#t=0.001" poster="og-image.jpg" muted loop playsinline preload="metadata">
```

| Attribute | Purpose |
|-----------|---------|
| `#t=0.001` | Shows first frame (fallback if no poster) |
| `poster` | OG image shown while loading |
| `preload="metadata"` | Loads only duration/dimensions, not video data |
| `muted` | Required for autoplay on mobile |
| `loop` | Videos loop continuously |
| `playsinline` | Prevents fullscreen takeover on iOS |

### Scroll-to-Play Observer

Location: `docs/js/media-gallery.js` → `setupScrollToPlay()`

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}, { threshold: [0, 0.4, 0.6, 1] });
```

When 40% visible → `video.play()` → browser loads and plays.

## Preloading Strategies We Tried (All Removed)

We tested several preloading strategies. None worked well - they either competed with active video playback or had no measurable benefit.

### 1. Hidden Video Element Preloading ❌

**What we tried:** Create hidden `<video preload="auto">` elements for top N videos during idle time.

**Why it failed:**
- Browsers deprioritize non-visible media
- Hidden videos competed for bandwidth with visible ones
- No reliable way to cancel when user switches to media view

### 2. Scroll-Ahead Prefetch Observer ❌

**What we tried:** IntersectionObserver with 500px-1000px rootMargin to set `preload="auto"` before videos enter viewport.

**Why it failed:**
- Once preload starts, it continues even if user scrolls past
- No cancellation = wasted bandwidth competing with videos user is actually watching
- Fast scrolling triggered many preloads that never got used

### 3. Sequential Preloading ❌

**What we tried:** Preload videos one at a time, waiting for each to buffer before starting the next.

**Why it failed:**
- Performed worse than parallel loading
- First video didn't load noticeably faster
- Delayed loading of subsequent videos

### 4. Fetch-Based Cache Warming ❌

**What we tried:** Use `fetch(url).then(r => r.blob())` to download videos into browser cache while in list view.

**Why it failed:**
- Partial downloads (if user switches views) are NOT cached - bytes wasted
- Completed downloads competed with active playback
- No way to prioritize "videos user will actually see"

### 5. Loading Spinner Overlay ❌

**What we tried:** Show spinner over poster image while video loads.

**Why it failed:**
- With multiple videos on screen, spinners draw attention away from content
- Poster image alone provides sufficient "loading" feedback
- Removed from gallery (kept in lightbox for single-video focus)

## Why Native Loading Works Best

1. **Browser knows best** - Modern browsers are highly optimized for media loading
2. **No competition** - Only videos being played actively load
3. **Automatic prioritization** - Browser prioritizes visible content
4. **Simplest code** - Less to maintain, less to break

## Configuration

| Setting | Location | Value |
|---------|----------|-------|
| Play threshold | `media-gallery.js` | 0.4 (40% visible) |
| Preload attribute | `media-gallery.js` | `metadata` |

## Related Files

- `docs/js/media-gallery.js` - Gallery rendering and scroll-to-play
- `docs/js/media-controls.js` - Video control UI
- `scripts/process_media.py` - Video compression settings

## References

- [web.dev - Fast playback with preload](https://web.dev/articles/fast-playback-with-preload)
- [MDN - IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
