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
trustworthiness: enum         # Required. high | medium | low | unverified
last_updated: YYYY-MM-DD      # Required. When file was last updated
---
```

### Type Values

**IMPORTANT: There are exactly 5 incident types. Use ONLY these values:**

| Value | Use For |
|-------|---------|
| `citizen-legal-detained-beaten` | U.S. citizens or legal residents wrongly detained/arrested/beaten |
| `bystander-arrested` | Observers/protesters arrested or attacked |
| `community-member-detained` | Non-criminal immigrants detained (includes workplace raids) |
| `school-incident` | Actions at/near schools |
| `official-response` | DHS/ICE official statements justifying specific incidents/arrests |

**Notes:**
- Workplace raids of non-U.S. citizens → use `community-member-detained`
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
1. [Article Title](URL) - Publication Name
2. [Article Title](URL) - Publication Name
- **Video:** [Description](URL) - Source
- **Photo:** [Description](URL) - Source

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

Examples:
- **HIGH** - 3 independent sources (Star Tribune, MPR, Fox 9)
- **HIGH** - Detailed Intercept investigation with named victim and direct quotes
- **HIGH** - Video evidence shows incident clearly
- **MEDIUM** - 2 sources (local news + union statement)
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

For DHS/ICE press releases and statements justifying specific arrests, create standalone documents with type `official-response`:

```markdown
---
date: YYYY-MM-DD
time: unknown
location: DHS Press Release
city: Minneapolis
type: official-response
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
1. [DHS Press Release](URL) - DHS.gov
2. [X Post](URL) - @DHSgov or @ICEgov

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
type: bystander-arrested
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
1. [Fox 9 Report](https://www.fox9.com/...) - Fox 9
- **Video:** [Arrest footage](https://www.fox9.com/...) - Fox 9

## Victim(s)
- **Citizenship:** U.S. Citizen
- **Status:** Released same day

## Editorial Assessment
**HIGH** - Video evidence, multiple news sources.
```
