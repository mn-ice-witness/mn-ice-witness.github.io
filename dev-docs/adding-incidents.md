# Adding New Incidents

Step-by-step guide for adding new incidents to the site.

## Step 0: Check for Duplicates and Not-Use List

**BEFORE adding a new incident**, perform these checks:

### A. Check Not-Use List
Check `dev-docs/not_use.md` to see if the story was already evaluated and rejected. This prevents re-adding stories that don't fit the project scope.

### B. Check for Existing Incident Files
Search existing incident files in `docs/incidents/` to ensure the incident isn't already documented:

1. **Search by location** - Same address, intersection, or business name
2. **Search by date** - Same day, even if different details emerged
3. **Search by victim name** - If known
4. **Search by keywords** - Key phrases from the incident

```bash
# Example searches
grep -r "Circle Pines" docs/incidents/
grep -r "2026-01-14" docs/incidents/
grep -r "bus stop" docs/incidents/
```

### C. If You Find a Potential Duplicate
**Do NOT create a new file.** Instead:

1. Open the existing incident file
2. Add new sources to the Sources section
3. Add new details to relevant sections (Timeline, Victim info, etc.)
4. Update `last_updated` in frontmatter
5. Update Editorial Assessment if trustworthiness improves

This keeps all information about an incident in one place and prevents fragmentation.

## Step 1: Verify the Incident

Before adding, ensure:

1. **At least one credible source** (news outlet, official statement)
2. **Assign trustworthiness based on criteria below**
3. **Avoid**: Single social media posts without corroboration

### Citizen Checks Are Valid Incidents

Well-sourced stories from major news outlets documenting U.S. citizens being stopped and subjected to citizenship checks are valid incidents, even if the citizen was not ultimately detained. These incidents demonstrate the pattern of racial profiling affecting American citizens. If a citizen was surrounded, stopped, questioned, or had to prove their citizenship, that qualifies as an incident.

**Title format:** Prefix the title with "Citizen Check:" for these incidents. Example:
```
# Citizen Check: U.S. Citizen Surrounded by ICE Agents at West St. Paul Restaurant
```

## Trustworthiness Rating Criteria

**IMPORTANT:** Use exactly one of these four values: `high`, `medium`, `low`, `unverified`. Do NOT use compound ratings like "medium-high" or "low-medium".

### HIGH - Strong Evidence
Assign HIGH when ANY of these conditions are met:

| Condition | Example |
|-----------|---------|
| 3+ independent sources | Star Tribune + MPR + Fox 9 all covering incident |
| Video/photo evidence | Bystander video shows incident, news embeds footage |
| Investigative report from major outlet | The Intercept, ProPublica, major newspaper with named sources and direct quotes |
| Single source + official corroboration | News report + ICE confirms arrest, or + lawsuit filed |
| Single source + credible primary sources | Article with named elected officials, attorneys, or direct victim interviews |

**Examples of HIGH with single source:**
- The Intercept detailed account with named victim and direct quotes → HIGH
- Sahan Journal report with city council member as witness → HIGH
- Local paper report + ICE confirmation of arrest → HIGH

### MEDIUM - Moderate Evidence
Assign MEDIUM when:

| Condition | Example |
|-----------|---------|
| 2 independent sources | Two separate news outlets cover incident |
| Official statement only | DHS press release without independent verification |
| Single established local source | Star Tribune or Pioneer Press report, no corroboration |
| Social media + one news pickup | Facebook video + one news article citing it |

### LOW - Limited Evidence
Assign LOW when:

| Condition | Example |
|-----------|---------|
| Single smaller outlet | Community paper or blog only |
| Social media with limited pickup | Facebook/X post, minimal news coverage |
| Conflicting details | Sources disagree on key facts |

### UNVERIFIED
- Reported but not independently confirmed
- Anonymous tips without supporting evidence
- Rumor or speculation

### Witness Corroboration Rule

**IMPORTANT:** Even well-reported incidents should be rated MEDIUM (not HIGH) if:

| Condition | Why It Limits Rating |
|-----------|---------------------|
| No independent firsthand witnesses on scene | Cannot corroborate the account beyond victim's word |
| Account relies solely on victim/family statement | No third-party verification of events |
| Agency disputes incident occurred (e.g., "zero record") | Creates he-said/she-said without independent evidence |

**Example:** A U.S. citizen claims they were stopped by ICE. Multiple news outlets report the story based on the citizen's account. However, no bystanders witnessed the stop, no video exists, and ICE claims "zero record" of the incident. This should be rated **MEDIUM** despite widespread media coverage, because the coverage is all sourced from a single account without independent corroboration.

### Good Sources
- Local news: KARE11, Fox9, KSTP, MPR News, Star Tribune, Pioneer Press
- National news: CNN, NPR, NBC, ABC, CBS, AP, Reuters
- Investigative: The Intercept, ProPublica
- Specialty: Sahan Journal (immigration), ICT (Native issues)
- Official: City of Minneapolis, MN AG, court documents

### Needs Corroboration
- Facebook posts
- X/Twitter posts (unless from officials)
- Reddit threads
- GoFundMe pages
- Single witness accounts

## Step 2: Create the File

1. Determine the date of the incident
2. Create file in correct folder:
   ```
   docs/incidents/2026-01/2026-01-15-description-slug.md
   ```
3. Use lowercase, hyphens, no spaces in filename

**IMPORTANT:** All incident files go in `docs/incidents/`, NOT a root-level `incidents/` folder.

## Step 3: Write the Content

Use the schema from `incident-schema.md`. At minimum include:

```markdown
---
date: 2026-01-15
time: unknown
location: Specific location
city: Minneapolis
type: citizen-detained
status: resolved
victim_citizenship: us-citizen
injuries: none
trustworthiness: medium
last_updated: 2026-01-15
---

# Title of Incident

## Summary
What happened in 2-3 sentences.

## Sources
1. [Source](URL) - Publication
- **Video:** [Description](URL) - Source (if available)

## Victim(s)
- **Name:** If public
- **Citizenship:** Status

## Editorial Assessment
**MEDIUM** - Why this rating.
```

## Step 4: Generate Summary JSON

**Critical step!** Run the summary generator to update the JSON file:

```bash
python-main scripts/generate_summary.py
```

This reads all markdown files in `docs/incidents/` and generates `docs/data/incidents-summary.json`.

**IMPORTANT:** Do NOT edit `incidents-summary.json` directly - it will be overwritten by the script.

## Step 5: Test Locally

```bash
./bin/run-server.sh
# Open http://localhost:8000
```

Verify:
- Incident appears in correct section
- Card displays properly
- Lightbox opens with full content
- Links work

## Step 6: Commit

```bash
git add docs/incidents/2026-01/2026-01-15-new-incident.md
git add docs/data/incidents-summary.json
git commit -m "Add incident: Title of incident"
git push
```

## Updating Existing Incidents

When new information emerges:

1. Edit the markdown file
2. Update `last_updated` in frontmatter
3. Add new sources to Sources section
4. Update Editorial Assessment if trustworthiness changes
5. Commit with message like "Update: New video evidence for Speedway incident"

## Cache Busting (Important!)

When updating HTML, CSS, or JS files, **bump the version number** to force browser cache refresh:

1. In `docs/index.html`, update all `?v=X` to `?v=X+1`:
   ```html
   <link rel="stylesheet" href="css/style.css?v=4">
   <script src="js/app.js?v=4"></script>
   ```

2. If updating CSS with image references, update versions there too:
   ```css
   background: url('../images/splash-1.jpg?v=4') center/cover;
   ```

**Why?** Cloudflare and browsers cache aggressively. Without version bumps, users may see stale content.

## Bulk Research Tips

When researching multiple incidents:

1. Search news sites for "ICE Minneapolis" filtered to date range
2. Check @DHSgov on X for their responses (include these!)
3. Search "Minneapolis ICE" on YouTube for video evidence
4. Check Sahan Journal for immigration-focused coverage
5. Check ICT (Indian Country Today) for Native American incidents

## DHS Responses

Always include DHS's official response when available:

1. Check [@DHSgov on X](https://x.com/DHSgov)
2. Check [DHS press releases](https://www.dhs.gov/news)
3. Check [ICE news releases](https://www.ice.gov/news/releases)

Quote them directly, then note if evidence contradicts their claims.
