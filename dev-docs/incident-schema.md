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

| Value | Use For |
|-------|---------|
| `fatal-shooting` | Deaths caused by ICE/CBP |
| `citizen-detained` | U.S. citizens wrongly detained/arrested |
| `bystander-arrested` | Observers/protesters arrested |
| `community-member-detained` | Non-criminal immigrants detained |
| `school-incident` | Actions at/near schools |
| `workplace-raid` | Raids at businesses |

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
**TRUSTWORTHINESS_LEVEL** - Brief explanation of why this rating.
```

## DHS Response Section

When DHS/ICE posts an official response (especially on X @DHSgov), include it:

```markdown
## DHS Response
Posted on X (@DHSgov):

> "Quote from their post"

**Note:** [Your factual analysis of whether evidence supports their claim]
```

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
