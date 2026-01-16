# CONTEXT.md

This file provides guidance to AI assistants when working with code in this repository.

## CRITICAL: Read Global User Context First

**BEFORE PROCEEDING, read `~/.context.md` and follow all advice there.** That file contains my general coding preferences, style guidelines, and critical instructions that apply to ALL projects. The instructions in ~/.context.md override any conflicting defaults.

If ~/.context.md doesn't exist, notify the user.

## CRITICAL: Read Developer Documentation

**BEFORE making changes, read the `dev-docs/` folder:**

1. `dev-docs/architecture.md` - System design and file structure
2. `dev-docs/incident-schema.md` - Exact markdown format for incidents
3. `dev-docs/adding-incidents.md` - Step-by-step guide to add incidents
4. `dev-docs/research-sources.md` - Where to find and verify incidents
5. `dev-docs/researching-responses.md` - How to find and document official federal responses
6. `dev-docs/project-status.md` - Current state and pending work
7. `dev-docs/not_use.md` - Stories evaluated and rejected (check before adding new incidents)

These docs are the source of truth for how this project works.

## Project Overview

**MN ICE Files** is a documentation website tracking civil rights incidents involving ICE (Immigration and Customs Enforcement) and CBP (Customs and Border Protection) in the Minneapolis-St. Paul area during Operation Metro Surge (December 2025 - present).

**Purpose:** To provide factual, well-sourced documentation of incidents where:
1. U.S. citizens are detained, arrested, or harmed by federal immigration agents
2. U.S. citizens are subjected to citizenship checks (stopped, surrounded, questioned) even if not detained
3. Bystanders or observers are arrested for exercising First Amendment rights
4. Non-criminal immigrants who are positive community members are detained
5. Other egregious civil rights violations occur

**Note on Citizen Checks:** Well-sourced stories from major news outlets documenting U.S. citizens being stopped and subjected to citizenship checks are valid incidents, even if the citizen was not ultimately detained. These incidents demonstrate the pattern of racial profiling affecting American citizens.

**Design Philosophy:**
- Fact-based and credible presentation
- Multiple corroborating sources for each incident
- Editorial trustworthiness ratings based on source quality
- Mobile-first responsive design
- Quick-loading with all content in markdown files

## Code Structure

```
GIT_MN_ICE_FILES/
├── CONTEXT.md           # This file
├── bin/
│   └── run-server.sh    # Local development server
├── docs/                # Website content folder (ALL content here)
│   ├── index.html       # Main entry point
│   ├── css/
│   │   └── style.css    # Mobile-first styles
│   ├── js/
│   │   ├── app.js       # Main application logic
│   │   ├── parser.js    # Markdown parser
│   │   └── lightbox.js  # Incident detail lightbox
│   └── incidents/       # ALL incident markdown files (ONLY location!)
│       ├── 2025-12/     # December 2025 incidents
│       │   └── YYYY-MM-DD-slug.md
│       └── 2026-01/     # January 2026 incidents
│           └── YYYY-MM-DD-slug.md
└── dev-docs/            # Developer documentation
```

**IMPORTANT:** All incident files MUST be in `docs/incidents/`. There is no separate `incidents/` folder at the root level. The website serves directly from `docs/`.

## Incident Markdown Schema

Each incident file follows this exact format:

```markdown
---
date: YYYY-MM-DD
time: HH:MM (if known, else "unknown")
location: Specific location
city: Minneapolis/St. Paul/etc
type: citizen-legal-detained-beaten | bystander-arrested | community-member-detained | school-incident | official-response  # These 5 types only; comma-separate for multiple (e.g., "citizen-legal-detained-beaten, school-incident")
status: ongoing | resolved | under-investigation
victim_citizenship: us-citizen | legal-resident | undocumented | asylum-seeker | unknown
injuries: none | minor | serious | fatal
trustworthiness: high | medium | low | unverified
last_updated: YYYY-MM-DD
---

### Type Categories (exactly 5)
| Type | Website Section | Use For |
|------|-----------------|---------|
| `citizen-legal-detained-beaten` | Citizens | U.S. citizens or legal residents wrongly detained/beaten |
| `bystander-arrested` | Bystanders | Observers/protesters arrested or attacked |
| `community-member-detained` | Immigrants | Non-criminal immigrants detained, **including workplace raids** |
| `school-incident` | Schools | Actions at/near schools |
| `official-response` | Response | DHS/ICE official statements |

**Note:** Multiple types ARE allowed. Use comma-separated values when an incident fits multiple categories (e.g., `type: citizen-legal-detained-beaten, school-incident`).

# Incident Title

## Summary
Brief 2-3 sentence summary of what happened.

## Sources
1. [Source Title](URL) - Publication
2. [Source Title](URL) - Publication
- **Video:** [Description](URL) - Source
- **Photo:** [Description](URL) - Source

## Victim(s)
- **Name:** (if public)
- **Age:**
- **Occupation:**
- **Citizenship:**
- **Background:** Brief relevant background

## Timeline
- **HH:MM** - Event 1
- **HH:MM** - Event 2

## Official Accounts

### DHS/ICE Statement
Quote or summary of official federal position.

### Local Officials
Statements from mayor, governor, police, etc.

## Witness Accounts
Direct quotes or summaries from witnesses.

## Editorial Assessment
Analysis of source reliability and what can be confidently stated vs. disputed.
```

## Development Workflow

### Setup (First Time)

```bash
# Install git hooks
./scripts/setup-hooks.sh
```

This installs a pre-commit hook that automatically:
1. Regenerates `docs/data/incidents-summary.json` from markdown files
2. Cache busts `docs/index.html` with a timestamp

### Local Development

```bash
# Run the local dev server
./bin/run-server.sh

# Or manually:
python-main -m http.server 8000 --directory docs
```

### Adding New Incidents

1. Create file in `docs/incidents/YYYY-MM/YYYY-MM-DD-slug.md`
2. Follow the exact schema above (Summary → Sources → Victim(s) → ...)
3. Ensure at least 2 corroborating sources for "high" trustworthiness
4. **Run the summary generator** to update the JSON:
   ```bash
   python-main scripts/generate_summary.py
   ```
5. Test locally before pushing

**IMPORTANT:** The `docs/data/incidents-summary.json` file is auto-generated by `scripts/generate_summary.py`. Do NOT edit this JSON file directly - it will be overwritten. Only edit the markdown incident files, then run the script.

### Deployment

This site is deployed via Cloudflare Pages from the `docs/` folder.

## Key Guidelines

1. **Check for Duplicates First:** Before adding a new incident, search existing files in `docs/incidents/` by location, date, victim name, and keywords. If the incident is already documented, **merge new information into the existing file** rather than creating a duplicate.
2. **Sources First:** Never add an incident without at least one credible source
3. **Neutral Language:** Describe facts, not emotions
4. **Multiple Perspectives:** Include official statements even if disputed
5. **Update Regularly:** Mark `last_updated` when new information emerges
6. **Trustworthiness Ratings:** (see `dev-docs/adding-incidents.md` for full criteria)
   - `high` = Strong evidence (see criteria below)
   - `medium` = Moderate evidence
   - `low` = Limited evidence, needs corroboration
   - `unverified` = Reported but not confirmed

   **HIGH** requires ANY of:
   - 3+ independent sources
   - Video/photo evidence from the incident
   - Detailed investigative report from nationally recognized outlet (The Intercept, ProPublica, major newspaper) with named sources
   - Single source with official corroboration (ICE/DHS confirmation, lawsuit filing, elected official statement)
   - Single source with credible primary sources (named attorneys, direct victim interviews, public records)

   **MEDIUM** requires ANY of:
   - 2 independent sources
   - Official statement only (DHS press release, without independent verification)
   - Single source from established local outlet without additional corroboration

   **LOW:**
   - Single source from smaller outlet without corroboration
   - Social media posts with limited news pickup
6. **Research Official Responses:** When documenting any incident, always search for DHS/ICE official responses and add them to the Response tab. See `dev-docs/incident-schema.md` for the `official-response` format.

## Researching Official Responses

When documenting incidents, ALWAYS search for and document official federal responses:

1. **DHS Press Releases:** https://www.dhs.gov/news-releases/press-releases
2. **ICE News Releases:** https://www.ice.gov/news/releases
3. **X/Twitter accounts:** @DHSgov, @ICEgov
4. **Major news coverage:** Search "[incident] DHS statement" or "ICE response [location]"

Document responses even when claims are disputed. Include the official position and note discrepancies with other evidence.
