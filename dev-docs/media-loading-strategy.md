# Media Loading Strategy

This document describes how videos and images are loaded in the media gallery, with a focus on mobile performance and bandwidth efficiency.

## Overview

The site uses a **multi-stage preloading strategy** to balance fast video playback with minimal bandwidth waste:

1. **Metadata-only by default** - Videos load only dimensions/duration initially
2. **Background preload on init** - Top 6 videos fully preload while user views list
3. **Scroll-ahead prefetch** - Videos load 500px before entering viewport
4. **Play on visibility** - Videos auto-play when 40% visible

## The Problem We're Solving

Mobile users reported slow/choppy video loading. The challenges:

- Videos are large files (even compressed)
- Mobile networks are unpredictable
- Users with ad blockers were having issues (now fixed - see `removed-tracking.md`)
- Default view is "list", so media gallery isn't immediately visible
- We don't want to waste bandwidth loading videos users never see

## Implementation Details

### Stage 1: Default Video Element

Location: `docs/js/media-gallery.js` → `renderCard()`

```html
<video src="video.mp4#t=0.001" muted loop playsinline preload="metadata" disableRemotePlayback>
```

| Attribute | Purpose |
|-----------|---------|
| `#t=0.001` | Shows first frame as poster (avoids black rectangle) |
| `preload="metadata"` | Loads only duration/dimensions, not video data |
| `muted` | Required for autoplay on mobile |
| `loop` | Videos loop continuously |
| `playsinline` | Prevents fullscreen takeover on iOS |
| `disableRemotePlayback` | Prevents Chromecast/AirPlay prompts |

### Stage 2: Background Preload on App Init

Location: `docs/js/app.js` → `init()`

```javascript
const preload = () => MediaGallery.preloadTopVideos(4);
if ('requestIdleCallback' in window) {
    requestIdleCallback(preload);
} else {
    setTimeout(preload, 1000);
}
```

**How it works:**
1. App loads and renders list view (default)
2. Browser goes idle (user is reading list)
3. `requestIdleCallback` fires, calling `preloadTopVideos()`
4. Creates hidden `<video preload="auto">` elements **one at a time**
5. Waits for each video to reach `canplaythrough` before starting the next
6. Hidden videos self-remove after loaded or 30s timeout

**Why `requestIdleCallback`?**
- Doesn't block main thread or initial render
- Uses spare CPU/network capacity
- Falls back to `setTimeout(fn, 1000)` on older browsers

**Why sequential (not parallel) preloading?**
- Video #1 gets 100% of available bandwidth
- First video is ready as fast as possible
- No bandwidth competition between multiple videos
- Users see video #1 load quickly, others follow

Location: `docs/js/media-gallery.js` → `preloadTopVideos()` and `preloadSingleVideo()`

```javascript
async preloadTopVideos(count = 6) {
    // Get video incidents in display order
    let mediaIncidents = App.incidents.filter(i => i.hasLocalMedia && i.localMediaType === 'video');
    if (!ViewState.sortByUpdated) {
        mediaIncidents = await this.sortByOrder(mediaIncidents);
    }

    const toPreload = mediaIncidents.slice(0, count);

    // Load videos SEQUENTIALLY - wait for each to be ready before starting next
    for (const incident of toPreload) {
        const mediaUrl = App.getMediaUrl(incident.localMediaPath, incident.mediaVersion);
        if (this.preloadedVideos.has(mediaUrl)) continue;

        await this.preloadSingleVideo(mediaUrl);
    }
}

preloadSingleVideo(mediaUrl) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        video.src = mediaUrl;
        video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
        document.body.appendChild(video);

        this.preloadedVideos.add(mediaUrl);

        const cleanup = () => {
            video.remove();
            resolve();
        };

        video.addEventListener('canplaythrough', cleanup, { once: true });
        setTimeout(cleanup, 30000);
    });
}
```

**Why hidden video elements instead of `<link rel="preload">`?**

`<link rel="preload" as="video">` is **NOT supported in Chrome or Safari** - it throws console warnings:
```
<link rel=preload> uses an unsupported `as` value
```

The valid `as` values are: `audio`, `document`, `fetch`, `font`, `image`, `script`, `style`, `track`, `worker`. Note that `video` is NOT in this list despite appearing in some documentation.

Hidden video elements with `preload="auto"`:
- Work reliably across all browsers
- Leverage browser's native video buffering
- Self-clean after loading completes
- Track loaded URLs to avoid duplicates

### Stage 3: Scroll-Ahead Prefetch Observer

Location: `docs/js/media-gallery.js` → `setupPrefetchObserver()`

```javascript
setupPrefetchObserver(gallery) {
    const prefetchObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                video.preload = 'auto';  // Start loading video data
                prefetchObserver.unobserve(video);  // Only trigger once
            }
        });
    }, { rootMargin: '500px 0px' });  // 500px ahead of viewport

    videos.forEach(video => prefetchObserver.observe(video));
}
```

**How it works:**
1. When gallery renders, observer watches all videos
2. When a video is 500px from viewport, observer fires
3. Changes `preload` from `metadata` to `auto`
4. Browser starts loading actual video data
5. Observer unobserves (one-time trigger)

**Why 500px root margin?**
- Gives ~2-4 seconds of scroll time to load
- Accounts for fast scrolling on mobile
- Ensures videos are buffered before they become visible
- Balances responsiveness vs bandwidth

### Stage 4: Play on Visibility

Location: `docs/js/media-gallery.js` → `setupScrollToPlay()`

```javascript
setupScrollToPlay(gallery) {
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

    videos.forEach(video => observer.observe(video));
}
```

**How it works:**
1. Separate observer watches video visibility
2. When 40% visible, calls `video.play()`
3. When scrolled away, calls `video.pause()`
4. Multiple thresholds for smooth transitions

**Why 40% threshold?**
- Video is meaningfully visible to user
- Not too aggressive (avoids playing barely-visible videos)
- Provides smooth scroll-to-play experience

## Tracking Preloaded Videos

Location: `docs/js/media-gallery.js`

```javascript
const MediaGallery = {
    preloadedVideos: new Set(),
    // ...
}
```

Both `preloadTopVideos()` and `setupPrefetchObserver()` track URLs in `preloadedVideos` Set to avoid:
- Duplicate preload requests
- Re-triggering preload for already-loaded videos
- Unnecessary network requests

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APP INITIALIZATION                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. Load incidents JSON                                             │
│  2. Render list view (default)                                      │
│  3. requestIdleCallback → preloadTopVideos(6)                       │
│     └── Creates hidden <video preload="auto"> for videos 1-6        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USER SWITCHES TO MEDIA VIEW                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. MediaGallery.render() creates video elements                    │
│     └── All videos: preload="metadata"                              │
│  2. setupPrefetchObserver() watches all videos                      │
│     └── rootMargin: 500px (load before visible)                     │
│  3. setupScrollToPlay() watches all videos                          │
│     └── threshold: 40% (play when visible)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SCROLLS DOWN                           │
├─────────────────────────────────────────────────────────────────────┤
│  Video enters 500px zone:                                           │
│    └── prefetchObserver fires → preload="auto" → starts loading     │
│                                                                     │
│  Video 40% visible:                                                 │
│    └── scrollToPlay observer fires → video.play()                   │
│                                                                     │
│  Video scrolls away:                                                │
│    └── scrollToPlay observer fires → video.pause()                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Configuration

| Setting | Location | Current Value | Notes |
|---------|----------|---------------|-------|
| Background preload count | `media-gallery.js` | 6 | Number of videos to preload on init |
| Prefetch root margin | `media-gallery.js` | 500px | How far ahead to start loading |
| Play threshold | `media-gallery.js` | 0.4 (40%) | Visibility ratio to trigger play |

## Bandwidth Considerations

**What we load immediately:**
- Metadata for all videos (~few KB each)
- Full video data for top 6 videos (background, during idle time)

**What we load on scroll:**
- Videos within 500px of viewport

**What we never load:**
- Videos user never scrolls to

**Estimated bandwidth for typical session:**
- List view only: ~0 video data
- Media view, no scroll: ~6 videos × ~2-5MB = 12-30MB
- Media view, full scroll: All videos

## Browser Compatibility

### `<link rel="preload" as="video">` - NOT SUPPORTED

Despite appearing in some documentation, `as="video"` is **not supported**:

| Browser | Support |
|---------|---------|
| Chrome | ❌ Logs warning, ignores |
| Safari | ❌ Logs warning, ignores |
| Firefox | ⚠️ Partial (appends to DOM instead) |
| Edge | ❌ Logs warning, ignores |

**Our solution:** Use hidden `<video preload="auto">` elements instead. This works reliably across all browsers.

### IntersectionObserver - WELL SUPPORTED

| Browser | Support |
|---------|---------|
| Chrome 51+ | ✅ |
| Safari 12.1+ | ✅ |
| Firefox 55+ | ✅ |
| Edge 15+ | ✅ |

## Known Limitations

1. **Column layout affects visibility order**
   - Masonry layout means "first" video might not be top-left
   - Prefetch observer handles this dynamically

2. **No cancellation of in-flight requests**
   - If user quickly switches views, preloads continue
   - Browser handles this reasonably well

3. **Hidden video elements use some memory**
   - 6 videos × ~few MB each during preload
   - Self-remove after `canplaythrough` or 30s timeout

## Future Improvements to Consider

### Adaptive preload count
```javascript
// Adjust based on connection speed
const count = navigator.connection?.effectiveType === '4g' ? 8 : 3;
MediaGallery.preloadTopVideos(count);
```

### Save-Data header respect
```javascript
// Skip preloading if user has Save-Data enabled
if (navigator.connection?.saveData) return;
```

### Battery-aware preloading
```javascript
// Reduce preloading on low battery
if ('getBattery' in navigator) {
    const battery = await navigator.getBattery();
    if (!battery.charging && battery.level < 0.15) return;
}
```

### Poster images instead of #t=0.001
- Generate actual poster images during media processing
- Would load faster than video metadata
- Requires changes to `process_media.py`

### Video quality tiers
- Serve lower quality on slow connections
- Requires encoding multiple versions
- Significant increase in storage/complexity

## Related Files

- `docs/js/media-gallery.js` - Gallery rendering and observers
- `docs/js/app.js` - App init and preload trigger
- `docs/js/media-controls.js` - Video control UI
- `scripts/process_media.py` - Video compression settings
- `dev-docs/media-controls.md` - Video player documentation

## Testing

To verify preloading is working:

1. Open DevTools → Network tab
2. Filter by "media" or video file extension
3. Load site in list view
4. Watch for 6 video requests after ~1 second (background preload)
5. Switch to media view
6. Scroll slowly and watch prefetch requests fire 500px ahead

To test without preloading:
```javascript
// In console, before switching to media view:
MediaGallery.preloadedVideos.clear();
```

## References

- [web.dev - Fast playback with preload](https://web.dev/articles/fast-playback-with-preload)
- [web.dev - Lazy loading video](https://web.dev/articles/lazy-loading-video)
- [Can I use - link rel preload](https://caniuse.com/link-rel-preload)
- [MDN - IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
