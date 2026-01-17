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
last_updated: YYYY-MM-DD      # Required. When file was last updated
---
```

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
last_updated: YYYY-MM-DD
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
last_updated: 2026-01-13
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
- Trailing "- Publication" after the URL
- Unnumbered sources
- Italic lines about "photos/videos referenced above"
