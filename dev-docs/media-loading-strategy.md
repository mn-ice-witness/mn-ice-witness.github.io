# Media Loading Strategy

This document describes how videos and images are loaded in the media gallery, with a focus on mobile performance and bandwidth efficiency.

## Overview

The site uses a **multi-stage preloading strategy** to balance fast video playback with minimal bandwidth waste:

1. **Metadata-only by default** - Videos load only dimensions/duration initially
2. **Background preload on init** - Top 4 videos preload while user views list
3. **Scroll-ahead prefetch** - Videos load 200px before entering viewport
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
3. `requestIdleCallback` fires, calling `preloadTopVideos(4)`
4. Creates `<link rel="preload" as="video">` for first 4 videos
5. Browser fetches videos in background at low priority

**Why `requestIdleCallback`?**
- Doesn't block main thread or initial render
- Uses spare CPU/network capacity
- Falls back to `setTimeout(fn, 1000)` on older browsers

Location: `docs/js/media-gallery.js` → `preloadTopVideos()`

```javascript
async preloadTopVideos(count = 4) {
    // Get video incidents in display order
    let mediaIncidents = App.incidents.filter(i => i.hasLocalMedia && i.localMediaType === 'video');
    if (!ViewState.sortByUpdated) {
        mediaIncidents = await this.sortByOrder(mediaIncidents);
    }

    // Create preload links for top N
    const toPreload = mediaIncidents.slice(0, count);
    toPreload.forEach(incident => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = mediaUrl;
        document.head.appendChild(link);
    });
}
```

**Why link preload instead of hidden video elements?**
- Lower memory footprint
- Browser manages priority automatically
- Doesn't create unnecessary DOM elements
- Works even before gallery is rendered

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
    }, { rootMargin: '200px 0px' });  // 200px ahead of viewport

    videos.forEach(video => prefetchObserver.observe(video));
}
```

**How it works:**
1. When gallery renders, observer watches all videos
2. When a video is 200px from viewport, observer fires
3. Changes `preload` from `metadata` to `auto`
4. Browser starts loading actual video data
5. Observer unobserves (one-time trigger)

**Why 200px root margin?**
- Gives ~1-2 seconds of scroll time to load
- Not so large that we load too many videos
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
- Duplicate preload links
- Re-triggering preload for already-loaded videos
- Unnecessary network requests

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APP INITIALIZATION                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. Load incidents JSON                                             │
│  2. Render list view (default)                                      │
│  3. requestIdleCallback → preloadTopVideos(4)                       │
│     └── Creates <link rel="preload"> for videos 1-4                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USER SWITCHES TO MEDIA VIEW                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. MediaGallery.render() creates video elements                    │
│     └── All videos: preload="metadata"                              │
│  2. setupPrefetchObserver() watches all videos                      │
│     └── rootMargin: 200px (load before visible)                     │
│  3. setupScrollToPlay() watches all videos                          │
│     └── threshold: 40% (play when visible)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SCROLLS DOWN                           │
├─────────────────────────────────────────────────────────────────────┤
│  Video enters 200px zone:                                           │
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
| Background preload count | `app.js` | 4 | Number of videos to preload on init |
| Prefetch root margin | `media-gallery.js` | 200px | How far ahead to start loading |
| Play threshold | `media-gallery.js` | 0.4 (40%) | Visibility ratio to trigger play |

## Bandwidth Considerations

**What we load immediately:**
- Metadata for all videos (~few KB each)
- Full video data for top 4 videos (background, low priority)

**What we load on scroll:**
- Videos within 200px of viewport

**What we never load:**
- Videos user never scrolls to

**Estimated bandwidth for typical session:**
- List view only: ~0 video data
- Media view, no scroll: ~4 videos × ~2-5MB = 8-20MB
- Media view, full scroll: All videos

## Known Limitations

1. **`<link rel="preload" as="video">` browser support**
   - Works in Chrome, Edge, Firefox
   - Safari support is inconsistent
   - Fallback: Videos still load via prefetch observer

2. **No prioritization within preload**
   - All 4 background videos load with same priority
   - Could potentially prioritize video 1 > 2 > 3 > 4

3. **Column layout affects visibility order**
   - Masonry layout means "first" video might not be top-left
   - Prefetch observer handles this dynamically

4. **No cancellation of in-flight requests**
   - If user quickly switches views, preloads continue
   - Browser handles this reasonably well

## Future Improvements to Consider

### Adaptive preload count
```javascript
// Adjust based on connection speed
const count = navigator.connection?.effectiveType === '4g' ? 6 : 2;
MediaGallery.preloadTopVideos(count);
```

### Prioritized preloading
```javascript
// Load first video with high priority, rest with low
link.fetchPriority = index === 0 ? 'high' : 'low';
```

### Save-Data header respect
```javascript
// Skip preloading if user has Save-Data enabled
if (navigator.connection?.saveData) return;
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
4. Watch for 4 video requests after ~1 second (background preload)
5. Switch to media view
6. Scroll slowly and watch prefetch requests fire 200px ahead

To test without preloading:
```javascript
// In console, before switching to media view:
MediaGallery.preloadedVideos.clear();
```
