# TalentFlux

TalentFlux is a public hiring intelligence dashboard for software companies. It tracks public Greenhouse and Lever postings, stores snapshots in Neon Postgres, computes hiring momentum and AI-share signals, and publishes a production Next.js dashboard.

Production:

- App: [talentflux.vercel.app](https://talentflux.vercel.app)
- Repo: [github.com/jpdama/talentflux](https://github.com/jpdama/talentflux)
- Methodology: [docs/methodology.md](docs/methodology.md)

## What It Does

- Tracks live openings across a curated software cohort
- Scores momentum, AI-share, leadership, remote, and geo-expansion signals
- Publishes a dashboard, company pages, methodology page, and CSV export
- Falls back cleanly from Neon to live provider reads, then to bundled sample data

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Recharts
- Neon Postgres
- Drizzle ORM
- GitHub Actions

## Local Setup

Requirements:

- Node.js `18.18+`
- npm `9+`

Run locally:

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run seed:companies
npm run ingest
npm run dev
```

If `DATABASE_URL` is unset, the app still works using live provider reads and then sample data.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | Neon/Postgres connection string |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public app URL |
| `OPENAI_API_KEY` | No | Enables AI-generated summaries |
| `OPENAI_MODEL` | No | Summary model override |
| `LIVE_REFRESH_WINDOW_MINUTES` | No | Manual refresh throttle window |

## Core Commands

```bash
npm run dev
npm run build
npm run test
npm run ingest
npm run summaries
```

## Deployment

TalentFlux is deployed on Vercel with Neon Postgres.

Recommended order:

1. Add environment variables in Vercel.
2. Run database migrations.
3. Seed the tracked company cohort.
4. Run ingest.
5. Verify the production URL.

Build command:

```bash
npm run build
```

## Scheduled Ingestion

`.github/workflows/ingest.yml` runs every 4 hours and can also be triggered manually. It installs dependencies, runs migrations, seeds companies, and executes the ingest pipeline.

## Notes

- Signal quality depends on public provider API availability and metadata quality.
- Historical quality improves as more daily snapshots accumulate.
- AI summaries are optional; deterministic summaries remain available without an API key.
