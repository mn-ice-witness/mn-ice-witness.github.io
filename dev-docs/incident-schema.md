# Incident Markdown Schema

Every incident is a markdown file with YAML frontmatter. This document defines the exact schema.

## File Naming

```
docs/incidents/YYYY-MM/YYYY-MM-DD-slug.md
```

Examples:
- `docs/incidents/2026-01/2026-01-07-renee-good-shooting.md`
- `docs/incidents/2025-12/2025-12-10-mubashir-lunch-break.md`

**IMPORTANT:** All incident files MUST be in `docs/incidents/`. The website serves directly from `docs/`.

## Frontmatter Fields

```yaml
---
date: YYYY-MM-DD              # Required. Incident date
time: HH:MM or "unknown"      # Optional. Time of day
location: string              # Required. Specific location
city: string                  # Required. Minneapolis, St. Paul, etc.
type: enum                    # Required. See types below
status: enum                  # Required. ongoing | resolved | under-investigation
victim_citizenship: enum      # Required. See values below
injuries: enum                # Required. none | minor | serious | fatal
trustworthiness: enum         # Required. EXACTLY ONE OF: high | medium | low | unverified (no compound values like "medium-high")
created: YYYY-MM-DDTHH:MM:SS  # Required. When incident was first added to site
last_updated: YYYY-MM-DDTHH:MM:SS  # Required. When last MAJOR update occurred (see rules)
---
```

### `created` and `last_updated` Field Rules

**Format:** Full ISO 8601 timestamp with seconds: `YYYY-MM-DDTHH:MM:SS`

#### ⚠️ USE THE ACTUAL CURRENT TIME (Critical!)

**To get the current timestamp, run:**
```bash
./bin/timestamp.sh
```

**Never guess or make up a timestamp** — LLMs consistently fabricate plausible-looking times that are wrong.

| Example | Correct? |
|---------|----------|
| `2026-01-19T14:23:47` | ✅ Actual time when making the change |
| `2026-01-19T12:00:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T14:30:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T23:59:59` | ❌ Artificial end-of-day timestamp |

**Why?** Incorrect timestamps break the "Sort by Updated" feature and mislead users.

---

**`created`**: Set to the ACTUAL current time when you first create the file. Never changes after that.

**`last_updated`**: Set to the ACTUAL current time when making a MAJOR story update.

**When adding a new incident:** Set BOTH `created` and `last_updated` to the exact current time.

**When updating an existing incident:**

| Update Type | Change `last_updated`? |
|-------------|------------------------|
| Case development (ruling, release, charges) | ✅ YES |
| Status change (detained → released) | ✅ YES |
| New facts emerge (identity confirmed, details) | ✅ YES |
| Merging duplicate incidents | ✅ YES |
| Adding more sources | ❌ NO |
| Formatting/schema changes | ❌ NO |
| Trustworthiness rating change | ❌ NO |
| Typo fixes | ❌ NO |

See `adding-incidents.md` for detailed guidance.

### Type Values

**IMPORTANT: There are exactly 5 incident types. Use ONLY these values:**

| Value | Use For |
|-------|---------|
| `citizens` | U.S. citizens or legal residents **racially profiled or mistakenly targeted while going about daily life** — targeted for who they are |
| `observers` | People **detained or attacked for filming, observing, or protesting** ICE — targeted for what they were doing |
| `immigrants` | Non-criminal immigrants detained (includes workplace raids) |
| `schools-hospitals` | Actions at/near schools or hospitals, including patient targeting and workplace audits |
| `response` | DHS/ICE official statements justifying specific incidents/arrests |

**Citizens vs Observers — Key Distinction:**
Both categories may involve U.S. citizens being detained. Choose based on WHY they were targeted:
- **`citizens`** = Racial profiling or mistaken identity. Person was just living their life (working, driving, shopping, walking).
- **`observers`** = First Amendment retaliation. Person was actively filming, following, watching, or protesting ICE.

**Notes:**
- **Multiple types ARE allowed** - use comma-separated values (e.g., `type: citizens, schools-hospitals`) when an incident fits multiple categories
- Workplace raids of non-U.S. citizens → use `immigrants`
- Do NOT use `citizen-detained`, `workplace-raid`, or other variant types

### Victim Citizenship Values

| Value | Meaning |
|-------|---------|
| `us-citizen` | U.S. Citizen |
| `legal-resident` | Green card, visa, legal status |
| `asylum-seeker` | Pending asylum application |
| `undocumented` | No legal status |
| `unknown` | Status not confirmed |

## Body Structure

```markdown
# Incident Title
```

### UNVERIFIED Incidents - Special Formatting

For incidents with `trustworthiness: unverified`, add two special elements:

1. **Title suffix**: Add `(UNVERIFIED)` to the end of the title
2. **Warning message**: Add a bold italic disclaimer between title and Summary

```markdown
# Incident Title (UNVERIFIED)

***No mainstream media has reported on this incident. It is based on social media posts only. If you have a media source, please [contact us](mailto:mnicewitness@proton.me).***

## Summary
```

This allows us to make editorial judgments about incidents worth documenting while clearly communicating the verification level to readers.

### Updates Section

```markdown
## Updates
(ONLY for incidents with major story updates - omit for most incidents)
- **Jan 19** - Brief description of major update
- **Jan 18** - Earlier major update

## Summary
Brief 2-3 sentence summary. First sentence appears in card preview.

## Sources
All sources numbered. Videos first, then articles. Every source includes outlet name and date.

1. Instagram Video (Jan 15, 2026): [Shawn Jackson interview](URL)
2. YouTube Video (Jan 14, 2026): [Full press conference](URL)
3. FOX 9 (Jan 15, 2026): [6 children hospitalized after flash bang](URL)
4. Star Tribune (Jan 14, 2026): [ICE agents clash with residents](URL)
5. CNN (Jan 15, 2026): [Minneapolis family describes attack](URL)

## Victim(s)
- **Name:** (if public, else "Not disclosed")
- **Age:**
- **Occupation:**
- **Citizenship:**
- **Background:** Brief relevant context

## Timeline
- **HH:MM** - Event 1
- **HH:MM** - Event 2
- **Later** - Event 3

## Official Accounts

### DHS/ICE Statement
Quote or summary of federal position.

### Local Officials
Statements from mayor, governor, police, etc.

## Witness Accounts
Direct quotes or summaries.

## Editorial Assessment
**TRUSTWORTHINESS_LEVEL** - Brief explanation of why this rating, citing the specific criteria met.

**IMPORTANT:** Use exactly one rating value. Do NOT use compound ratings like "medium-high".

Examples:
- **HIGH** - 3 independent sources (Star Tribune, MPR, Fox 9)
- **HIGH** - Detailed Intercept investigation with named victim and direct quotes
- **HIGH** - Video evidence shows incident clearly
- **MEDIUM** - 2 sources (local news + union statement)
- **MEDIUM** - Well reported but no independent firsthand witnesses on scene to corroborate; account relies on victim/family statement
- **LOW** - Single community paper report, needs corroboration
```

## DHS Response Section (within incidents)

When DHS/ICE posts an official response to a specific incident (especially on X @DHSgov), include it in the incident file:

```markdown
## DHS Response
Posted on X (@DHSgov):

> "Quote from their post"

**Note:** [Your factual analysis of whether evidence supports their claim]
```

## Official Response Documents (standalone)

For DHS/ICE press releases and statements justifying specific arrests, create standalone documents with type `response`:

```markdown
---
date: YYYY-MM-DD
time: unknown
location: DHS Press Release
city: Minneapolis
type: response
status: resolved
victim_citizenship: unknown
injuries: none
trustworthiness: high
last_updated: YYYY-MM-DDTHH:MM:SS
---

# DHS Statement: [Title describing what they're justifying]

## Summary
Brief description of what DHS/ICE claims and who they claim to have arrested.

## Sources
1. DHS.gov (Jan 8, 2026): [DHS Press Release](URL)
2. X Post (Jan 8, 2026): [@DHSgov statement](URL)

## Official Statement
Full quote or detailed summary of their justification.

### Criminal History Cited
List the specific criminal history claims made by DHS/ICE:
- **Name:** Crime claimed

## Fact Check
Analysis of whether the claims can be independently verified.

## Editorial Assessment
Assessment of whether DHS claims match available evidence.
```

### Researching Official Responses

When documenting incidents, search for DHS/ICE official responses:

1. **DHS Press Releases:** https://www.dhs.gov/news-releases/press-releases
2. **ICE News Releases:** https://www.ice.gov/news/releases
3. **X/Twitter accounts:**
   - @DHSgov
   - @ICEgov
   - @DHSBlueCampaign
   - @Abordar (CBP)
4. **Major news coverage:** Search "[incident name] DHS response" or "ICE statement [location]"

Include responses even when claims are disputed - document the official position and note discrepancies.

## Example Minimal Incident

```markdown
---
date: 2026-01-11
time: afternoon
location: Speedway, Snelling & Portland
city: St. Paul
type: observers
status: resolved
victim_citizenship: us-citizen
injuries: minor
trustworthiness: high
created: 2026-01-13T14:30:00
last_updated: 2026-01-13T14:30:00
---

# Bystander Filming Arrest Tackled at Speedway

## Summary
A U.S. citizen filming an ICE arrest was tackled and detained despite complying with orders to back up.

## Sources
1. FOX 9 Video (Jan 11, 2026): [Arrest footage from scene](https://www.fox9.com/...)
2. FOX 9 (Jan 11, 2026): [Video shows bystander tackled at Speedway](https://www.fox9.com/...)

## Victim(s)
- **Citizenship:** U.S. Citizen
- **Status:** Released same day

## Editorial Assessment
**HIGH** - Video evidence, multiple news sources.
```

## Source Formatting Rules

### What Counts as a Source

**A source MUST:**
1. **Be directly about the incident** - The source must contain content specifically about this incident. A business's general homepage or social media profile page is NOT a source.
2. **Have a valid, working link** - Every source must link to a specific page, article, video, or post. No link = not a source.
3. **Be accessible** - If a link requires login or is behind a paywall that prevents viewing the incident content, it should not be listed as a source.

**NOT valid sources:**
- Business homepages (e.g., restaurant's main website)
- General social media profile pages (e.g., @francisburgerjoint Instagram profile)
- Pages that don't mention the incident
- Dead links

**Valid sources include:**
- News articles about the incident
- Specific social media posts about the incident (direct link to post)
- Video embeds of incident footage
- Official statements (with link to statement)

### Format
Every source follows this format:
```
N. Outlet Name (Date): [Article/Video Title](URL)
```

- **All sources numbered** starting at 1
- **Outlet name first** (FOX 9, Star Tribune, Instagram Video, etc.)
- **Date in parentheses** in format (Mon DD, YYYY)
- **Colon** after the date
- **Title in brackets** linked to URL
- **Videos listed FIRST**, then articles
- **Every source MUST have a link** - no link means it's not a source

### Video Sources
For video content, use platform name + "Video":
```
1. Instagram Video (Jan 15, 2026): [Shawn Jackson interview](URL)
2. YouTube Video (Jan 14, 2026): [Full press conference](URL)
3. Facebook Video (Jan 12, 2026): [Witness footage of arrest](URL)
4. X Video (Jan 13, 2026): [FOX 9 coverage](URL)
5. CBS Video (Jan 14, 2026): [News report with footage](URL)
```

### Article Sources
For articles, use outlet name:
```
6. FOX 9 (Jan 15, 2026): [6 children hospitalized after flash bang](URL)
7. Star Tribune (Jan 14, 2026): [ICE agents clash with residents](URL)
8. CNN (Jan 15, 2026): [Minneapolis family describes attack](URL)
9. Bring Me The News (Jan 13, 2026): [Federal agents use tear gas](URL)
10. New York Times (Jan 15, 2026): [Couple Says ICE Agents Gassed Them](URL)
```

### Video Priority Order
When an incident has multiple videos, order them by importance:
1. Full interviews / press conferences with victim
2. Original source video (posted by witness/victim)
3. News outlet video coverage
4. Social media reposts

### Common Outlet Names
Use consistent outlet names:
- `FOX 9` (not Fox 9 or Fox9)
- `Star Tribune` (not StarTribune)
- `Bring Me The News` (not BMTN)
- `CBS Minnesota` (not CBS MN or WCCO)
- `KARE 11` (not Kare11)
- `MPR News` (not Minnesota Public Radio)
- `Pioneer Press` (not St. Paul Pioneer Press)
- `Sahan Journal`
- `Minnesota Reformer`

### What NOT to Include
- Sources without links (no link = not a source)
- Links that don't directly reference the incident (e.g., business homepages, social media profile pages)
- Trailing "- Publication" after the URL
- Unnumbered sources
- Italic lines about "photos/videos referenced above"
- "Social Media" sections with general profile links (only include specific posts about the incident)

## Internal Links to Other Incidents

When linking to another incident within our site (e.g., in "Related incident" or "See also" references), use **relative hash URLs**, NOT markdown file paths.

### Correct Format
```markdown
[Related incident](#2026-01-19-dhs-response-saly-detention)
```

### Wrong Formats
```markdown
[Related incident](2026-01-19-dhs-response-saly-detention.md)  ❌ Links to .md file
[Related incident](http://localhost:8000/#2026-01-19-dhs-response-saly-detention)  ❌ Absolute URL
[Related incident](https://mnicefiles.com/#2026-01-19-dhs-response-saly-detention)  ❌ Absolute URL
```

### Why Hash URLs?
This site is a single-page application. All navigation uses hash-based routing:
- The browser stays on `index.html`
- The hash (`#incident-slug`) tells the app which incident to display
- Linking to `.md` files will show raw markdown, not the formatted incident
