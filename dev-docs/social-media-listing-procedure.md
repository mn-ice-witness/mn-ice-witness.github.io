# Social Media Listing Procedure

Generate daily listings of new/updated incidents for social media posts.

## How to Request

Ask Claude: "Give me a social media update for [date]"

## Bluesky Format (300 character limit)

Posts MUST fit within 300 characters total. Use this bullet format:

```
Jan 19 New & Updated:

  - [Most compelling detail]
  - [Second most compelling]
  - [Third]
  - [Fourth if space allows]

https://mn-ice-witness.org/#new-updated-01-19-2026
```

## Writing Guidelines

1. **Lead with the most striking detail** - the thing that makes people stop scrolling
2. **Use visceral, specific details** - "chained like Hannibal Lecter" not "mistreated"
3. **Keep bullets SHORT** - 5-8 words max per bullet
4. **Prioritize U.S. citizens** - these stories cut through partisan framing
5. **Include numbers when striking** - "400K views", "5 days after approval"

## What Gets Included

- **NEW**: Incidents with `created:` timestamp on that date
- **UPDATED**: Incidents with `last_updated:` timestamp on that date (but created earlier)

Only include updates that are substantive story developments (new victim accounts, status changes, major new sources). Don't include minor source additions.

## Example Posts

### Good Example (278 chars)
```
Jan 18 New & Updated:

  - Citizen detained for "accent"
  - Snowplow driver held in El Paso
  - Viral doorbell video (400K)
  - Noem backtracks on pepper spray
  - Manager tackled observing ICE

https://mn-ice-witness.org/#new-updated-MM-DD-YYYY
```

### Another Example
```
Jan 19 New & Updated:

  - Citizen: "chained like Hannibal Lecter"
  - Hmong elder story goes national
  - Parents detained 5 days after I-130
  - Refugee mom taken driving to church

https://mn-ice-witness.org/#new-updated-MM-DD-YYYY
```

## Finding the Day's Updates

Run this to find incidents created or updated on a specific date:
```bash
grep -l "created: 2026-01-19\|last_updated: 2026-01-19" docs/incidents/**/*.md
```

## Individual Incident Posts

For posting about a single incident, ask Claude: "Give me a SM post with url for [incident-slug]"

### Copying Posts from CLI

The CLI adds formatting (bullets, spacing) that breaks copy/paste. To get clean text:

1. Ask Claude to write the post to an HTML file and open it in browser
2. Copy from the browser window

Claude will run:
```bash
cat > /tmp/post.html << 'EOF'
<pre style="font-family: system-ui; font-size: 16px;">[POST TEXT HERE]</pre>
EOF
open /tmp/post.html
```
