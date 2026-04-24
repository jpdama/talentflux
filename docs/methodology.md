# TalentFlux Methodology

TalentFlux transforms public hiring data into competitor strategy signals.

## Data Collection

- Greenhouse Job Board API: `GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`
- Lever Postings API: `GET https://api.lever.co/v0/postings/{site}?mode=json`

All requests are server-side. No scraping of gated pages is used for the main product.

## Normalization

Each posting is converted into a canonical record:

- company
- provider + provider job id
- role family
- seniority
- location + inferred region
- workplace type
- AI-role flag
- GTM-role flag
- extracted skills
- first seen / last seen timestamps

## Metrics

TalentFlux calculates:

- open jobs
- new jobs in 7 days
- closed jobs in 7 days
- net new jobs in 7 days
- AI share
- GTM share
- leadership share
- remote share
- active location count
- new locations in 30 days
- 7-day forecast

## Momentum Score

```text
Momentum Score =
0.35 * net_new_z
+ 0.20 * ai_share_delta
+ 0.15 * gtm_share_delta
+ 0.15 * new_location_z
+ 0.15 * leadership_share_delta
- concentration_penalty
```

The final score is normalized to 0-100.

## Alert Logic

Alert cards are explainable, not black-box:

- AI Buildout
- GTM Expansion
- Geo Expansion
- Leadership Hiring
- Hiring Cooldown
- Concentration Risk

Each alert is backed by a threshold rule and a short explanation in the UI.

## AI Summary Safety

The optional AI layer sees structured metrics and evidence only. It does not browse the web or add external claims. Responses are schema-validated and fall back to a deterministic summary when invalid or unavailable.
