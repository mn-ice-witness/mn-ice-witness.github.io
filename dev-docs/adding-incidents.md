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

### D. Similar Stories Are NOT Always the Same Incident

**IMPORTANT:** Do NOT combine separate incidents just because they seem related or similar. Create separate incident files when:

| Scenario | Action |
|----------|--------|
| Different dates | Separate incidents |
| Different people involved (even if same location/topic) | Separate incidents |
| Different actions (e.g., attorneys denied access vs. lawmakers denied access) | Separate incidents |
| Same underlying issue but distinct events | Separate incidents |
| Same event with new sources/details | Merge into existing incident |
| Same event covered by different outlets | Merge into existing incident |

**Example of what NOT to do:**
- "Attorneys denied access to detainees" (Jan 15-18) and "Congressional lawmakers denied access to facility" (Jan 10) are **two separate incidents**, even though both involve access denial at the same building. They occurred on different dates, involved different people, and had different official responses.

**Example of what TO do:**
- If three outlets cover the same person being detained on the same day, that's one incident with three sources.

**Key question:** Is this describing the same event with the same people on the same date? If no, create separate incidents.

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

### Citizens vs Observers — Choosing the Right Type

Both `citizens` and `observers` may involve U.S. citizens being detained. Choose based on **WHY they were targeted**:

| Type | Use When | Examples |
|------|----------|----------|
| `citizens` | Person was **racially profiled or mistakenly targeted** while going about daily life | On lunch break, driving, shopping, shoveling snow, leaving work |
| `observers` | Person was **targeted for filming, observing, or protesting** ICE operations | Following ICE vehicles, responding to alerts, filming arrests, at protests |

**Key question:** Was the person targeted for WHO THEY ARE (citizens) or WHAT THEY WERE DOING (observers)?

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

**Special Formatting for UNVERIFIED incidents:**

UNVERIFIED incidents require additional formatting to clearly communicate their verification status:

1. **Title suffix**: Add `(UNVERIFIED)` to the end of the title
2. **Warning message**: Add bold italic disclaimer between title and Summary:

```markdown
# Incident Title (UNVERIFIED)

***No mainstream media has reported on this incident. It is based on social media posts only. If you have a media source, please [contact us](mailto:mnicewitness@proton.me).***

## Summary
```

This allows editorial judgment about incidents worth documenting while clearly indicating verification level to readers.

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

### Operation PARRIS Context
If the incident involves a refugee or immigrant with **pending legal status** (I-130, green card application, etc.) being detained, add an Operation PARRIS context section. See [operation-parris.md](operation-parris.md) for details below.

### Source Requirements

**Every source MUST:**
1. **Be directly about the incident** - Link to specific content about this incident
2. **Have a valid, working link** - No link = not a source
3. **Be accessible** - Behind-login-wall content without visible incident information is not a source

**NOT valid sources:**
- Business homepages or general profile pages
- Social media profile pages (only specific posts about the incident count)
- Pages that don't mention the incident

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

### Language Guidelines

**This site's credibility depends on neutral, documentary tone.** Avoid emotional, excited, or loaded language throughout — in titles, summaries, source descriptions, and narrative text.

| Avoid (Emotional/Loaded) | Use Instead (Neutral) |
|--------------------------|----------------------|
| raid, ransack | search |
| storm, invade | enter |
| kidnapped, snatched | detained, arrested |
| terrorize, brutalize | use force on |
| horrific, shocking, disturbing | (omit - describe facts) |
| innocent victim | person, resident, citizen |
| exclusive, breaking, bombshell | (omit - just describe content) |
| explosive interview | interview |

**Source descriptions should be plain and factual:**
- Say "interview" not "exclusive interview"
- Say "video" not "shocking video" or "disturbing footage"
- Say "first on-camera interview" not "explosive first interview"
- Let readers judge the significance themselves

**General principles:**
- Report facts and let readers draw conclusions
- Witness/victim quotes may contain emotional language, but narrative text should not
- Describe actions objectively: "agents used a battering ram to enter" not "agents violently smashed through the door"
- Avoid superlatives and marketing language from news sources (strip out "exclusive," "shocking," etc.)
- **For official statements:** Report what was said accurately, not your interpretation. If an official says "vicious animals" referring to "murderers & criminals," don't editorialize that as "calling immigrants vicious animals." Let readers draw their own conclusions about the rhetoric.

Use the schema from `incident-schema.md`. At minimum include:

#### ⚠️ TIMESTAMP WARNING
**Set `created` and `last_updated` to the ACTUAL CURRENT TIME** when you create the file — not a rounded or made-up time.

**To get the current timestamp, run:**
```bash
./bin/timestamp.sh
```

Use the output for BOTH `created` and `last_updated` fields. **Never guess or make up a timestamp** — LLMs consistently fabricate plausible-looking times that are wrong.

```markdown
---
date: 2026-01-15
time: unknown
location: Specific location
city: Minneapolis
type: citizens
status: resolved
victim_citizenship: us-citizen
injuries: none
trustworthiness: medium
created: 2026-01-15T14:23:47   # ← Use ACTUAL current time, not rounded!
last_updated: 2026-01-15T14:23:47   # ← Same as created for new incidents
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
2. **Only update `last_updated` for substantive story changes** (see below)
3. Add new sources to Sources section
4. Update Editorial Assessment if trustworthiness changes
5. Commit with message like "Update: New video evidence for Speedway incident"

### When to Update `last_updated`

**IMPORTANT:** The `last_updated` field powers the "Sort by Updated" feature on the website. Only update it for **substantive story developments** — not routine maintenance.

#### ⚠️ USE THE ACTUAL CURRENT TIME (Critical!)

**When you update `last_updated`, use the EXACT current time** — not a rounded or made-up time.

| Example | Correct? |
|---------|----------|
| `2026-01-19T14:23:47` | ✅ Actual time when making the change |
| `2026-01-19T12:00:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T14:30:00` | ❌ Rounded time (clearly made up) |

**Why?** Incorrect timestamps break the sort order and mislead users about when content was actually updated.

**Format:** Full ISO 8601 timestamp with seconds: `YYYY-MM-DDTHH:MM:SS`

#### DO Update `last_updated` For:
| Change Type | Examples |
|-------------|----------|
| **Case developments** | Judge ruling, person released, charges filed, lawsuit filed |
| **Status changes** | Detained → Released, Under investigation → Resolved |
| **New facts about the incident** | Victim identity confirmed, location corrected, new details emerge |
| **Merging incidents** | When combining duplicate incident files |
| **Significant new witness accounts** | Major new testimony that changes understanding |

#### DO NOT Update `last_updated` For:
| Change Type | Why Not |
|-------------|---------|
| Adding more sources | Just expands documentation, doesn't change the story |
| Formatting/schema changes | Internal maintenance |
| Trustworthiness rating changes | Editorial judgment, not story change |
| Typo fixes | Cosmetic |
| Adding video/photo links | Just more documentation |

**Rationale:** Users who sort by "Updated" want to see incidents where something actually happened — a release, a ruling, new facts. They don't want to see incidents bubble up just because someone found another news article.

#### Example Commit Messages:
- ✅ "Update Gibson: judge orders release" → DO update `last_updated`
- ❌ "Add 5 new sources to Renee Good incident" → DO NOT update `last_updated`
- ❌ "Standardize source formatting" → DO NOT update `last_updated`

#### Adding an Updates Log

When making a MAJOR update to an incident, add an `## Updates` section right after the title (before Summary):

```markdown
# Incident Title

## Updates
- **Jan 18** - Added press conference: trophy photos allegation, overcrowded cell
- **Jan 18** - Gibson re-arrested, then released again; now on ankle monitor
- **Jan 18** - Federal judge rules arrest violated Fourth Amendment, orders release

## Summary
...
```

**Format:** Use simple dates like "Jan 18" — NOT full timestamps. The Updates section is user-facing and should be clean and readable.

**Write in plain language** — describe what happened, not what you did:
- ✅ "Gibson alleges ICE took 'trophy photos' of him"
- ❌ "Added press conference details"
- ✅ "Nasra Ahmed describes being chained 'like Hannibal Lecter'"
- ❌ "Added victim's first-person account; upgraded to HIGH trustworthiness"

Never mention internal details like trustworthiness changes, source additions, or schema updates. Users don't care about our process — they want to know what happened.

**Most incidents will NOT have an Updates section.** Only add it when there are major story developments worth tracking.

### NEVER Remove Valid Sources

**CRITICAL:** Never remove sources from an incident just because:
- A better version exists (e.g., video with original audio vs. one with music overlay)
- The source seems redundant
- You think another source covers it better

We want ALL valid sources documented. Let users decide what they care about. If one version is better than another, add a note in parentheses to clarify (e.g., "original audio" or "music overlay") but keep both.

**Only remove sources that are:**
- Fake or fabricated
- Proven false or misleading
- From unreliable/disreputable sources
- Permanently broken links (not just temporarily down)

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

## Operation PARRIS Context Section

When an incident involves a refugee or immigrant with **pending legal status** being detained, add a "Context: Operation PARRIS" section. This helps readers understand the broader pattern of targeting people with active immigration cases.

### When to Add This Section

Add when ANY of these apply:
- Victim had an approved or pending I-130 petition
- Victim was a refugee awaiting green card
- Victim had valid immigration documents and was in a legal process
- Victim was detained despite having legal status

### How to Add

**Two things to add:**

1. **Add note at end of Summary section:** `<em style="color: #888;">**Note: This story seems to follow a pattern of Operation PARRIS (Post-Admission Refugee Reverification and Integrity Strengthening) -- see more details on this below.**</em>`

2. **Add Context section before Editorial Assessment:**

```markdown
## Context: Operation PARRIS

[Victim name]'s detention fits a documented pattern of ICE targeting refugees with pending green card applications under **Operation PARRIS** (Post-Admission Refugee Reverification and Integrity Strengthening). According to [Fox 9](https://www.fox9.com/news/minnesota-fraud-dhs-launching-operation-parris-target-refugees-jan-9), approximately 5,600 green card applicants in Minnesota are being targeted through this [official DHS operation](https://www.uscis.gov/newsroom/news-releases/dhs-launches-landmark-uscis-fraud-investigation-in-minnesota).

[Global Refuge](https://www.globalrefuge.org/news/refugee-arrests-minnesota/) has documented that lawfully present refugees are being detained and transported to Texas within 24 hours with "no due process, no access to an attorney."
```

See [operation-parris.md](operation-parris.md) for full details and sources.
