# Analytics Decision

## Current State (2026-01-23)

Google Analytics was removed because the gtag script caused CSP errors and triggered "tracker blocked" warnings in privacy browsers (DuckDuckGo, uBlock Origin, etc.), which sometimes blocked media playback.

## The Problem

We want unique visitor counts, but:
- **Unique visitor counting requires tracking** - to know if someone is new vs returning, you must identify them (cookies, IP, fingerprinting)
- **Any client-side tracking triggers blockers** - privacy tools detect and block/warn about tracking scripts
- **No tracking = no visitor counts** - server logs only show raw request counts, not unique visitors

## Options

### 1. Cloudflare Web Analytics (Recommended)

**Pros:**
- Privacy-friendly (no cookies, no personal data, aggregated only)
- Enable from Cloudflare dashboard - no code changes needed
- Free with Cloudflare Pages
- Less likely to be blocked than Google Analytics

**Cons:**
- Still detected by some aggressive blockers
- Less detailed than Google Analytics

**To enable:** Cloudflare Dashboard → Analytics & Logs → Web Analytics → Enable

### 2. Google Analytics

**Pros:**
- Detailed visitor data, user flows, demographics

**Cons:**
- Blocked by most privacy tools
- Requires cookies and personal data collection
- Was causing issues with media playback for users with blockers

### 3. Server-side only (Cloudflare Traffic Analytics)

**Pros:**
- No client-side code, nothing to block
- Already available in Cloudflare dashboard

**Cons:**
- Only shows requests/bandwidth, not unique visitors
- Can't distinguish humans from bots reliably

### 4. Self-hosted analytics (Plausible, Umami, etc.)

**Pros:**
- Privacy-friendly
- Full control over data
- Less likely to be on blocker lists

**Cons:**
- Requires hosting/maintenance
- Additional cost
- Still client-side, so some blockers may still flag it

## Decision Needed

Which tradeoff is acceptable?

- [ ] Cloudflare Web Analytics - some blockers may flag it
- [ ] No visitor counting - rely on Cloudflare traffic stats only
- [ ] Self-hosted solution - more work but more control
