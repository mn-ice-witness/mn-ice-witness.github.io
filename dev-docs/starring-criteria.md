# Starring (Notable) Criteria

The `notable: true` field in incident frontmatter marks incidents as "starred" - these appear with visual prominence in the UI.

## CRITICAL: Trustworthiness Requirement

**Only incidents with `trustworthiness: high` may be starred.**

Starring an incident gives it prominent visual treatment and signals to readers that this is a key incident. We can only make that editorial judgment when we have high confidence in the facts - which requires high trustworthiness (3+ sources, video evidence, or official corroboration).

If an incident seems worthy of starring but only has medium trustworthiness:
1. Do NOT add `notable: true`
2. Note in the Editorial Assessment that it may warrant starring once additional sources emerge
3. Revisit when more corroboration becomes available

## When to Star an Incident

**Star incidents that represent the most egregious civil rights violations.** These are the stories that demonstrate the worst abuses of power and are essential for understanding the scope of Operation Metro Surge.

### Tier 1: Always Star (Most Egregious)

| Category | Description | Examples |
|----------|-------------|----------|
| **Fatal or life-threatening** | Someone died or nearly died | Renee Good shooting (fatal); Shawn Jackson children (infant stopped breathing) |
| **Video of physical abuse** | Clear video showing agents assaulting/brutalizing someone | Juan Carlos (knee to face on video); Observer shoved into traffic |
| **Hospitalization from assault** | Victim hospitalized with injuries from agents | Aliya Rahman (hospitalized); Juan Carlos (hospitalized) |
| **Chokehold/banned technique** | Use of banned restraint techniques | Mubashir (chokehold) |

### Tier 2: Strongly Consider Starring

| Category | Description | Examples |
|----------|-------------|----------|
| **U.S. citizen physically harmed** | Citizen punched, tackled, injured during detention | Jose Ramirez (punched); Christian Molina (car rammed) |
| **Prolonged unlawful detention** | U.S. citizen or legal resident held hours+ despite ID | Sigüenza/O'Keefe (8 hours); Oglala Sioux (days) |
| **Schools directly impacted** | Incident at/near school with students affected | Roosevelt High School (staffer detained, students tear gassed) |
| **Medical care denied** | Detained person denied necessary medical treatment | Hani Duglof (shackled despite skin condition); Aliya Rahman (denied care) |
| **Lead plaintiff in lawsuit** | Victim is named plaintiff in civil rights lawsuit | Mubashir (ACLU lawsuit) |
| **Treaty/sovereignty violation** | Detention of tribal citizens, sovereignty issues | Oglala Sioux (treaty violation) |

### Tier 3: Consider Starring

| Category | Description | Examples |
|----------|-------------|----------|
| **Detained for filming/observing** | First Amendment violation - arrested for filming | Ryan Ecklund (9 hours for filming) |
| **Family separation** | Children separated from parents | Eden Prairie (13-year-old); Burnsville family |
| **Refugee/asylum seeker with long tenure** | Person legally in US for years detained | Emmanuel Sackie (16 years in US); Hani Duglof (10 years) |
| **National/major media coverage** | Story picked up by national outlets extensively | Multiple sources help but alone doesn't warrant star |
| **Institutional targeting** | Hospitals, churches, schools targeted | Hennepin Healthcare subpoena |

## When NOT to Star

- **Routine workplace raids** without violence or special circumstances
- **DHS official responses** (these are in Response tab, not primary incidents)
- **Impact stories** without a specific victim (school absences, business closures)
- **Citizen checks** where person was not detained and no physical contact occurred
- **Incidents with limited documentation** even if potentially egregious

## Key Principle

**Video evidence of physical abuse is the strongest indicator.** When we have clear video showing agents:
- Kneeing/punching someone on the ground
- Choking someone
- Using excessive force during arrest
- Assaulting observers/bystanders

These incidents should ALWAYS be starred because the video provides incontrovertible evidence that contradicts official narratives.

## Current Starred Incidents (as of 2026-01-16)

### Tier 1 (Most Egregious)
1. **Renee Good** - U.S. citizen killed by ICE agent
2. **Juan Carlos brutality** - Video of agent kneeing man in face 5+ times
3. **Shawn Jackson children** - 6 children tear gassed, infant needed CPR
4. **Aliya Rahman** - Dragged from car, hospitalized, viral video (millions of views)
5. **Mubashir** - Chokehold, lead ACLU plaintiff

### Tier 2 (Severe)
6. **Oglala Sioux still detained** - U.S. citizens held days, treaty violation
7. **Jose Ramirez** - Native American citizen punched
8. **Christian Molina** - Citizen's car rammed, racial profiling
9. **Observer shoved into traffic** - Video shows dangerous shove
10. **Roosevelt High School** - School incident, staffer detained, tear gas
11. **Sigüenza/O'Keefe** - 8 hours detention, pressured for names

### Tier 3 (Notable)
12. **Target Richfield** - Citizens tackled at workplace
13. **Ryan Ecklund** - 9 hours detained for filming
14. **Emmanuel Sackie** - Refugee 16 years in US
15. **Hani Duglof** - Medical condition, shackled
16. **Eden Prairie 13-year-old** - Child trauma
17. **Burnsville family** - Family separation
18. **Hennepin Healthcare** - Hospital subpoena

## Reviewing Starring Decisions

Periodically review starred incidents to ensure consistency:
1. Are the most violent incidents starred?
2. Is there video evidence we should highlight?
3. Have any non-starred incidents become more significant (e.g., lawsuit filed)?
4. Are any starred incidents less significant than unstarred ones?

## Adding notable: true

In the incident frontmatter:

```yaml
---
date: 2026-01-13
...
trustworthiness: high
last_updated: 2026-01-16
notable: true
---
```

Place `notable: true` after `last_updated` but before the closing `---`.
