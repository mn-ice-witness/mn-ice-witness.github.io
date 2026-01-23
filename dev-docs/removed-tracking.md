# Removed Tracking Code

This file preserves tracking code that was removed from the site. Keep for reference if tracking needs to be restored.

## Google Analytics (removed 2026-01-23)

Was in `docs/index.html` at the top of `<head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N0KGYZ7FQX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-N0KGYZ7FQX');
</script>
```

**Property ID:** `G-N0KGYZ7FQX`

## CSP Headers for Analytics (removed 2026-01-23)

Was in `docs/_headers` Content-Security-Policy:

```
script-src: https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com
connect-src: https://www.google-analytics.com https://analytics.google.com https://cloudflareinsights.com
```

## Why Removed

Users with privacy blockers (DuckDuckGo browser, uBlock Origin, etc.) were having media blocked because blockers detected the tracking scripts. Removing tracking improves compatibility and respects user privacy.

## Alternative: Cloudflare Web Analytics

If analytics are needed in the future, Cloudflare Web Analytics can be enabled from the Cloudflare dashboard (no code changes needed). It's privacy-friendly and doesn't use cookies.
