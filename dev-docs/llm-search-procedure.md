# LLM Search Procedure for Finding New Incidents

Step-by-step guide for AI assistants to search for and document new ICE incidents.

## Before You Start

1. **Read existing incidents list** - Check `docs/incidents/` to see what's already documented
2. **Read not_use.md** - Check `dev-docs/not_use.md` for stories already evaluated and rejected
3. **Note the current date** - Search results are time-sensitive

## Search Strategy

### Step 1: Run Multiple Parallel Searches

Use web search tools to run these queries simultaneously:

```
ICE Minneapolis Minnesota [current month year] video evidence
ICE Minneapolis St Paul [current month year] physical abuse brutality
ICE Minnesota citizen detained wrongful arrest [current month year]
ICE raid Minnesota [recent dates]
```

### Step 2: Check Key Sources Directly

Search these specific sites:
- `"Bring Me The News" ICE Minnesota` - Best for daily raid lists
- `"Sahan Journal" ICE Minnesota` - Immigration-focused investigative coverage
- `"Star Tribune" ICE Minneapolis` - Local paper of record
- `"MPR News" ICE Minnesota` - Public radio, often first to report

### Step 3: Search for Video Evidence Specifically

Look for incidents with:
- Cell phone footage
- News station video
- Social media videos picked up by news
- Photo documentation

Priority searches:
```
ICE Minnesota video footage [month year]
ICE Minneapolis assault [month year] video
ProPublica ICE Minnesota [month year]
```

### Step 4: Check for Legal Actions/ACLU

Search for:
```
ACLU ICE Minnesota lawsuit [month year]
ICE Minnesota lawsuit citizen detained
```

### Step 5: Search Social Media Platforms

**CRITICAL:** Social media often has first-hand video evidence before news coverage.

#### X (Twitter)
```
site:x.com ICE Minnesota Minneapolis [month year]
site:twitter.com ICE Minneapolis [month year]
```

#### Bluesky
```
site:bsky.app ICE Minnesota Minneapolis [month year]
```

#### TikTok
```
site:tiktok.com ICE Minnesota Minneapolis [month year]
```

#### Instagram
```
site:instagram.com ICE Minnesota video [month year]
```

#### Threads
```
site:threads.net ICE Minnesota [month year]
```

#### Key Accounts to Monitor
- **@mnicewatch** (Instagram) - MN ICE Watch community tracking
- **@DHSgov** / **@ICEgov** (X) - Official DHS/ICE responses
- **Middle East Eye** (TikTok) - Often covers Minneapolis incidents
- Local reporter accounts on X

#### Important Notes on Social Media
- Social media posts alone are NOT sufficient for HIGH trustworthiness
- Look for videos that were later picked up by news outlets
- When you find a viral video, search for the victim's name or location to find news coverage
- If a social media post has video but no news pickup, add to "Needs More Research" and rate MEDIUM at best

### Step 6: Search the General Web

In addition to specific news sites, always search the general web for incidents:
```
"victim full name" ICE detained
"victim full name" Minnesota
incident location ICE arrest [date]
```

This catches coverage from smaller outlets, syndicated stories, and social media that may not appear in site-specific searches. If a story only appears in ONE source after general web searches, flag it as needing corroboration and rate trustworthiness as MEDIUM at best.

## Evaluating Search Results

### Cross-Reference Against Existing Files

For each potential incident found:

1. **Check by date** - Do we have `docs/incidents/YYYY-MM/YYYY-MM-DD-*.md` for that date?
2. **Check by victim name** - Grep for victim names in existing files
3. **Check by location** - Search for the street, business, or neighborhood
4. **Check not_use.md** - Is this story already evaluated and rejected?

```bash
# Example checks
grep -ri "victim name" docs/incidents/
grep -ri "location" docs/incidents/
grep -i "story keywords" dev-docs/not_use.md
```

### Priority: Video/Photo Evidence

**Highest priority incidents** to document:
- Video showing physical abuse by ICE
- Video of unlawful arrest or detention
- Photo evidence of injuries
- Footage of citizens being stopped/harassed

These provide incontrovertible evidence and should be documented with HIGH trustworthiness if from multiple sources.

### What Qualifies as a New Incident

**DOCUMENT** if:
- U.S. citizen detained, arrested, or harmed
- U.S. citizen subjected to citizenship check (stopped, questioned)
- Bystander/observer arrested for filming or watching
- Non-criminal community member detained
- ICE activity at schools, hospitals, churches
- Video/photo evidence of abuse

**DO NOT DOCUMENT** (add to not_use.md instead):
- Protest-only coverage without a civil rights incident
- Criminal investigations (drug trafficking, weapons)
- Detainees with criminal convictions
- Single unverified social media posts
- Rumors without any news pickup

## Output Format

After completing search, report:

### New Incidents Found
| Date | Location | Brief Description | Video/Photo? | Sources |
|------|----------|-------------------|--------------|---------|

### Already Documented
List incidents found that match existing files

### Added to not_use.md
List stories evaluated and rejected, with reasons

### Needs More Research
List incidents that need additional verification before documenting

## Tips for Effective Searches

1. **Search by date ranges** - "January 15 16 2026" finds recent activity
2. **Use quotes for exact phrases** - "Bring Me The News" ensures that site
3. **Check list articles** - Sites like BMTN often publish "List of major ICE raids on [date]"
4. **Follow up on vague mentions** - If a search mentions an incident briefly, search specifically for it
5. **Look for updates** - Existing incidents may have new information (updated video, victim spoke out, lawsuit filed)

## After Searching

1. **Report findings to user** - Summarize what was found
2. **Propose new incident files** - If any qualify, outline what would be documented
3. **Update not_use.md** - Add any evaluated/rejected stories
4. **Update existing incidents** - If new information found for existing files
5. **Add ALL discovered sources** - Even unverified links should be added to incident files

### Adding Sources to Existing Incidents

**CRITICAL:** When researching, add ALL discovered sources to incident files, even if unverified:

- Add new sources to the END of the Sources section (don't reorder existing sources)
- Include social media links (X, TikTok, Instagram, Threads, BlueSky, Facebook)
- Include international coverage (UK, Canadian, Australian outlets)
- Include commentary/opinion pieces that reference the incident
- Mark video sources with **VIDEO** tag for easy identification

Example format for adding sources:
```markdown
## Sources
1. [Existing source 1](url)
2. [Existing source 2](url)
...existing sources...
15. X - @username (Month Year): [Post description](url)
16. TikTok - @account (Month Year): [Video description](url) - **VIDEO**
17. Instagram Reel (Month Year): [Description](url) - **VIDEO**
18. Threads - @account (Month Year): [Post description](url)
```

This ensures:
- Complete documentation of all coverage
- Easy identification of video sources for media gallery
- Preservation of the historical record

## Example Search Session Log

```
Date: 2026-01-16
Searches run:
- ICE Minneapolis January 2026 video evidence ✓
- ICE Minnesota citizen detained January 2026 ✓
- Bring Me The News ICE January 15 2026 ✓
- ProPublica ICE chokehold Minnesota ✓

New incidents found:
- St. Paul school vans pulled over (Jan 13, 15) - Not yet documented

Already documented:
- Crystal bus stop parent (2026-01-14) ✓
- Aliya Rahman (2026-01-13) ✓
- Sigüenza & O'Keefe (2026-01-12) ✓

In not_use.md:
- North Minneapolis shooting (Sosa-Celis) - excluded

Needs verification:
- Albert Lea Hardee's activity - insufficient details
```
