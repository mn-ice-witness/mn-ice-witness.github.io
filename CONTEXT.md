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
8. `dev-docs/llm-search-procedure.md` - Step-by-step guide for LLMs to search for new incidents
9. `dev-docs/media-controls.md` - Video player controls strategy and fullscreen implementation
10. `dev-docs/social-media-listing-procedure.md` - How to generate daily Bluesky update posts
11. `dev-docs/ui-patterns.md` - **Read when doing UI work** - Reusable UI patterns (SVG icons, copy-to-clipboard, etc.)

These docs are the source of truth for how this project works.

## When Asked for Social Media Updates

**If the user asks for a social media update, Bluesky post, or daily listing:**

1. **Read `dev-docs/social-media-listing-procedure.md` first** - Contains format, character limits, and examples
2. **Find incidents created/updated on that date** using grep on `created:` and `last_updated:` timestamps
3. **Read each incident** to find the most compelling details
4. **Write bullets under 300 chars total** - Lead with the most striking/visceral detail

## When Asked to Find New Incidents or Sources

**If the user asks to search for new incidents, find new sources, or do research:**

1. **Read these files first:**
   - `dev-docs/llm-search-procedure.md` - Complete search procedure and efficiency tips
   - `dev-docs/not_use.md` - Stories already evaluated and rejected
   - `dev-docs/adding-incidents.md` - Criteria for what qualifies as an incident
   - `dev-docs/research-sources.md` - Where to find and verify incidents

2. **Use the Explore agent** to get a summary of existing incidents before searching

3. **Follow the daily search procedure** in `llm-search-procedure.md` for efficient recurring searches

4. **Always report:**
   - New incidents found (with sources)
   - Existing incidents that got new sources added
   - Stories added to not_use.md (with reasons)
   - Stories already in not_use.md that came up again

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
type: citizens | observers | immigrants | schools-hospitals | response  # These 5 types only; comma-separate for multiple (e.g., "citizens, schools-hospitals")
status: ongoing | resolved | under-investigation
victim_citizenship: us-citizen | legal-resident | undocumented | asylum-seeker | unknown
injuries: none | minor | serious | fatal
trustworthiness: high | medium | low | unverified  # EXACTLY ONE value, no compounds like "medium-high"
created: YYYY-MM-DDTHH:MM:SS      # REQUIRED: Exact time when file was created
last_updated: YYYY-MM-DDTHH:MM:SS  # REQUIRED: Exact time of last MAJOR update
---

### ⚠️ TIMESTAMP RULES (CRITICAL - Read Carefully!)

**LLMs CANNOT BE TRUSTED TO KNOW THE CURRENT TIME.** You must run a command to get it.

**To get the current timestamp, run:**
```bash
./bin/timestamp.sh
```

| When | What to do |
|------|------------|
| **Adding a new incident** | Run `./bin/timestamp.sh`, use output for BOTH `created` AND `last_updated` |
| **Making a significant story update** | Run `./bin/timestamp.sh`, use output for `last_updated` |

**NEVER guess or make up a timestamp.** LLMs consistently fabricate plausible-looking times that are wrong.

**Format:** Full ISO 8601 with seconds: `YYYY-MM-DDTHH:MM:SS`

### `last_updated` — When to Update (Important!)
Only change `last_updated` for **substantive story developments**:
- ✅ Case developments (ruling, release, charges filed)
- ✅ Status changes (detained → released)
- ✅ New facts emerge (identity confirmed, details corrected)
- ❌ Adding more sources (doesn't change the story)
- ❌ Formatting/typo fixes

See `dev-docs/adding-incidents.md` for full rules.

### Type Categories (exactly 5)
| Type | Website Section | Use For |
|------|-----------------|---------|
| `citizens` | Citizens | U.S. citizens or legal residents **racially profiled or mistakenly targeted while going about daily life** (working, driving, shopping, walking) — targeted for who they are |
| `observers` | Observers | People **detained or attacked for filming, observing, or protesting** ICE operations — targeted for what they were doing (First Amendment activity) |
| `immigrants` | Immigrants | Non-criminal immigrants detained, **including workplace raids** |
| `schools-hospitals` | Schools/Hospitals | Actions at/near schools or hospitals, including patient targeting and workplace audits |
| `response` | Response | DHS/ICE official statements |

**Citizens vs Observers:** Both may involve U.S. citizens being detained. The key distinction:
- **Citizens** = Targeted for WHO THEY ARE (racial profiling, mistaken identity, just living their lives)
- **Observers** = Targeted for WHAT THEY WERE DOING (actively filming, following, observing, protesting ICE)

**Note:** Multiple types ARE allowed. Use comma-separated values when an incident fits multiple categories (e.g., `type: citizens, schools-hospitals`).

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
**RATING** - Analysis of source reliability. RATING must be exactly one of: HIGH, MEDIUM, LOW, or UNVERIFIED.
No compound ratings (e.g., "MEDIUM-HIGH" is invalid). Must match frontmatter `trustworthiness` value.
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

**IMPORTANT:** The `docs/data/incidents-summary.json` file is auto-generated by `scripts/generate_summary.py`. Do NOT edit this JSON file directly - it will be overwritten. Only edit the markdown incident files, then run the script. The pre-commit hook runs this automatically on every commit.

### Adding Media (Videos/Images)

1. **Add raw media to `raw_media/`** with naming: `<incident-id>.raw.mov` or `<incident-id>.raw.png`
   - The incident-id matches the markdown filename (without `.md`)
   - Example: `2026-01-13-bovino-cbs-interview.raw.mov` → matches `2026-01-13-bovino-cbs-interview.md`
   - **IMPORTANT:** Files in `raw_media/` are NEVER modified by the pipeline - they are read-only source files
2. **Run the media pipeline:**
   ```bash
   python-main scripts/process_media.py
   ```
   This reads from `raw_media/` and creates compressed versions in `docs/media/<incident-id>.mp4`
   - Crops 5px from edges (removes screen recording artifacts)
   - Preserves audio if present in source file
   - Compresses for web delivery
3. **Update `docs/data/media-order.md`** to control gallery display order
   - Add the slug (the part after YYYY-MM-DD-) to desired position
   - Example: add `bovino-cbs-interview` (not the full incident-id)
4. **Commit** - the pre-commit hook auto-regenerates `incidents-summary.json`

**IMPORTANT - Never use `--force` unless explicitly asked:**
- The `--force` flag reprocesses ALL videos, which is slow and unnecessary
- To reprocess a single video: delete the output in `docs/media/`, then run the pipeline
- The pipeline only processes files where the output is missing or older than the source

**Multi-part videos:**
- For long videos split into multiple recordings, use `:01`, `:02` suffix pattern
- Example: `2026-01-13-incident:01.raw.mov`, `2026-01-13-incident:02.raw.mov`
- Pipeline validates sequence is complete, concatenates in order, outputs single file

**IMPORTANT - Raw media is never modified:**
- `raw_media/` contains original source files that are NEVER touched
- `docs/media/` contains processed web-optimized versions
- If source has no audio, output has no audio (macOS Cmd+Shift+5 requires enabling audio capture)

**IMPORTANT - Never manually edit `incidents-summary.json`:**
- The pre-commit hook runs `scripts/generate_summary.py` automatically
- Media files are auto-detected by matching incident-id to files in `docs/media/`
- Only edit markdown incident files; the JSON is regenerated from them

### Deployment

This site is deployed via Cloudflare Pages from the `docs/` folder.

## Key Guidelines

1. **Check for Duplicates First:** Before adding a new incident, search existing files in `docs/incidents/` by location, date, victim name, and keywords. If the incident is already documented, **merge new information into the existing file** rather than creating a duplicate.
2. **Sources First:** Never add an incident without at least one credible source
3. **Neutral, Objective Language:** This site's credibility depends on factual, documentary tone. Avoid emotional, excited, or loaded language:
   - Use "search" not "raid" or "ransack"
   - Use "enter" not "storm" or "invade"
   - Use "detained" not "kidnapped" or "snatched"
   - Avoid editorializing words like "terrorize," "brutalize," "horrific," "shocking," "exclusive"
   - Avoid excited phrasing like "breaking," "explosive," "bombshell"
   - Report what happened factually; let readers draw their own conclusions
   - Quotes from witnesses/victims can contain emotional language, but narrative text should not
   - **Source descriptions:** Use plain, descriptive labels. Say "interview" not "exclusive interview." Say "video" not "shocking video."
   - **For official statements:** Report what was said accurately, not your interpretation. If Trump says "vicious animals" referring to "murderers & criminals," don't editorialize that as "calling immigrants vicious animals." Let readers draw their own conclusions about the rhetoric.
4. **Multiple Perspectives:** Include official statements even if disputed
5. **Update Regularly:** Mark `last_updated` when new information emerges
6. **Trustworthiness Ratings:** (see `dev-docs/adding-incidents.md` for full criteria)

   **IMPORTANT:** Use exactly one of these four values. Do NOT use compound ratings like "medium-high".
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

   **Witness Corroboration Rule:**
   Even well-reported incidents should be rated MEDIUM (not HIGH) if:
   - No independent firsthand witnesses were present on scene to corroborate
   - The account relies solely on the victim's or their family's statement
   - The agency disputes the incident occurred (e.g., "zero record")

7. **Research Official Responses:** When documenting any incident, always search for DHS/ICE official responses and add them to the Response tab. See `dev-docs/incident-schema.md` for the `response` type format.
8. **Internal Links:** When linking to other incidents, use relative hash URLs: `[See related](#2026-01-15-incident-slug)`. Do NOT link to `.md` files or use absolute URLs. See `dev-docs/incident-schema.md` for details.

## Researching Official Responses

When documenting incidents, ALWAYS search for and document official federal responses:

1. **DHS Press Releases:** https://www.dhs.gov/news-releases/press-releases
2. **ICE News Releases:** https://www.ice.gov/news/releases
3. **X/Twitter accounts:** @DHSgov, @ICEgov
4. **Major news coverage:** Search "[incident] DHS statement" or "ICE response [location]"

Document responses even when claims are disputed. Include the official position and note discrepancies with other evidence.
