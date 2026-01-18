# LLM Search Procedure for Finding New Incidents

Step-by-step guide for AI assistants to search for and document new ICE incidents.

## Daily/Recurring Search Mode

This procedure is designed to be run **1-2 times daily**. For efficient recurring searches:

1. **Focus on the last 24-48 hours** - Prioritize yesterday and today's dates
2. **Check BMTN daily lists first** - Bring Me The News publishes daily roundup articles
3. **Use the Task tool with Explore agent** - Get comprehensive incident summary before searching
4. **Cross-reference quickly** - Many searches will confirm existing coverage; that's expected

### Quick Start for Daily Searches
```
1. Read existing incidents (use Explore agent for summary)
2. Search BMTN for "List of major ICE raids" + [yesterday/today date]
3. Run 4-5 parallel web searches for recent incidents
4. Cross-reference results against existing files
5. Document new incidents, add sources to existing, update not_use.md
```

## Before You Start

1. **Read existing incidents list** - Check `docs/incidents/` to see what's already documented
2. **Read not_use.md** - Check `dev-docs/not_use.md` for stories already evaluated and rejected
3. **Note the current date** - Search results are time-sensitive
4. **Check recent git activity** - `git diff HEAD~5 --name-only` shows recently added incidents

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

### Updating Incident Content When New Information Emerges

When new sources contain significant new information (court rulings, releases, new charges, victim statements), update the incident file accordingly:

1. **Update the Summary** - Reflect major developments (e.g., judge's ruling, release, new charges)
2. **Update Status** - Change `ongoing` to `resolved` if case concluded
3. **Update Timeline** - Add new dated events
4. **Update last_updated** - Set to current date

Example: If a judge rules an arrest was unconstitutional, update the summary to mention the ruling, not just add the source.

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

## Key BMTN Daily List URLs

Bring Me The News publishes daily roundup articles with predictable URL patterns:

```
bringmethenews.com/minnesota-news/list-of-major-ice-raids-updates-in-minnesota-on-[day]-jan-[date]
bringmethenews.com/minnesota-news/list-of-ice-raids-protest-updates-in-minnesota-on-[day]-jan-[date]
```

Example searches:
```
site:bringmethenews.com ICE January 17 2026
"Bring Me The News" list ICE raids January 17
```

These daily lists often contain brief mentions of incidents that may warrant their own file. Always check these first for recurring searches.

## Efficiency Tips for Recurring Searches

1. **Run parallel web searches** - Use 4-5 WebSearch calls in a single message for speed
2. **Grep before creating** - Before creating a new incident, grep for victim name/location
3. **Update existing files generously** - Adding sources to existing incidents is valuable work
4. **Track what you've checked** - Report "Already documented" and "In not_use.md" findings
5. **Date-specific searches** - Include specific dates (e.g., "January 16 17 2026") in queries
6. **Note unclear incidents** - Add borderline cases to not_use.md with "may revisit" notes

## High-Value Sources for New Incidents

| Source | Best For | Check Frequency |
|--------|----------|-----------------|
| Bring Me The News | Daily raid lists, quick updates | Every search |
| Sahan Journal | In-depth investigative, immigrant communities | Daily |
| Star Tribune | Paper of record, official statements | Daily |
| MPR News | Breaking news, audio interviews | Daily |
| ICT News | Native American incidents | When relevant |
| ACLU Minnesota | Legal actions, civil rights cases | Weekly |
| CBS Minnesota / KSTP / KARE 11 | Video evidence, local TV coverage | As needed |

## Example Search Session Log

```
Date: 2026-01-17
Searches run:
- ICE Minneapolis January 2026 video evidence ✓
- ICE Minnesota citizen detained January 2026 ✓
- site:bringmethenews.com ICE January 16 17 2026 ✓
- ACLU Minnesota ICE lawsuit January 2026 ✓
- MPR News ICE Minnesota January 16 17 ✓

New incidents found:
- NewsGuild union member detained (Jan 16) - ADDED

Already documented (confirmed good coverage):
- Aliya Rahman (2026-01-13) ✓
- Garrison Gibson (2026-01-12) ✓ - added new sources
- Oglala Sioux detained (2026-01-14) ✓ - added new sources
- El Tapatio Willmar (2026-01-15) ✓

Added to not_use.md:
- Burnsville Salvation Army (Jan 16) - insufficient details
- New Hope apartment ICE presence - no specific victims
- Far-right counter-protest - protest only, no enforcement incident

In not_use.md (already excluded):
- North Minneapolis shooting (Sosa-Celis) - excluded

Needs verification:
- None this session
```
