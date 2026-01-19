# Social Media Listing Procedure

Generate daily listings of new/updated incidents for social media posts.

## How to Request

Ask Claude: "Give me a social media listing for [date]"

Claude will:
1. Find all incidents created or updated on that date
2. Read each story to extract key details
3. Write a catchy 1-sentence summary highlighting the most important/striking details
4. Provide the shareable link

## Output Format

```
[Date] New & Updated Posts

[Catchy summary sentence with the most striking details from that day's stories]

https://mn-ice-witness.org/#new-updated-MM-DD-YYYY
```

## Example Output

```
Jan 18 New & Updated Posts

U.S. citizen detained "because of your accent" in front of his 5-year-old daughter; St. Paul snowplow driver with legal work status now held in El Paso; Hmong citizen's doorbell video refusing agents goes viral with 400K views.

https://mn-ice-witness.org/#new-updated-01-18-2026
```

## What Gets Included

- **NEW**: Incidents with `created:` timestamp on that date
- **UPDATED**: Incidents with `last_updated:` timestamp on that date (but `created:` on a different date)

## Automatic URL (for direct sharing)

```
https://mn-ice-witness.org/#new-updated-MM-DD-YYYY
```
