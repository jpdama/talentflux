# TalentPulse

TalentPulse is a public competitor hiring intelligence dashboard for AI/SaaS companies. It ingests live public job-board data from Greenhouse and Lever, stores historical snapshots in Postgres, computes strategy signals like AI hiring share and geographic expansion, and presents them in a polished Next.js dashboard.

## Features

- Live and near-real-time competitor job tracking
- Historical trend analysis and hiring momentum scoring
- AI-role detection, role-family classification, and geo expansion alerts
- Grounded AI summaries with deterministic fallback
- Public dashboard, company drill-down pages, CSV export, and methodology page

## Architecture Summary

Next.js serves the public dashboard and API routes. GitHub Actions runs scheduled ingestion jobs that fetch public provider APIs, normalize the data, and store both current jobs and daily company metrics in Neon Postgres. The app reads from Postgres when available, otherwise falls back to live provider reads and then bundled sample data.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Recharts
- TanStack Table
- Neon Postgres
- Drizzle ORM + migrations
- GitHub Actions
- OpenAI Responses API for optional summaries

## Installation

### Prerequisites

- Node.js `>= 18.18.0`
- npm `>= 9`
- A Postgres database if you want persisted history

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. If you are using Postgres, update `DATABASE_URL` in `.env.local`.

4. Run migrations:

   ```bash
   npm run db:migrate
   ```

5. Seed the tracked company cohort:

   ```bash
   npm run seed:companies
   ```

6. Run the first ingest:

   ```bash
   npm run ingest
   ```

7. Start the app:

   ```bash
   npm run dev
   ```

If you do not configure a database, the app still works by falling back to live provider reads and then bundled sample data.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | No | Postgres connection string for persisted history |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public app base URL |
| `OPENAI_API_KEY` | No | Enables AI-generated summaries |
| `OPENAI_MODEL` | No | Defaults to `gpt-4.1-mini` |
| `LIVE_REFRESH_WINDOW_MINUTES` | No | Throttle window for manual refresh |
| `INGEST_COHORT` | No | Reserved for future cohort switching |

## Local Development

- `npm run dev` starts the Next.js dev server
- `npm run ingest` fetches and persists the latest public jobs
- `npm run summaries` re-runs the ingest pipeline and refreshes summaries
- `npm run test` runs unit tests
- `npm run test:e2e` runs Playwright smoke tests

## Deployment

### Vercel + Neon

1. Create a Neon Postgres database.
2. Add the environment variables in Vercel.
3. Deploy the repo to Vercel.
4. Add the same secrets to GitHub Actions.
5. Run `npm run db:migrate`, `npm run seed:companies`, and `npm run ingest`.
6. Verify the public URL.

### Build Commands

```bash
npm install
npm run db:migrate
npm run seed:companies
npm run build
```

### Runtime Commands

```bash
npm run start
```

## Scheduled Ingestion

The repository includes `.github/workflows/ingest.yml`, which runs every 4 hours and can also be triggered manually. It:

1. Installs dependencies
2. Runs database migrations
3. Seeds the company list
4. Executes the ingest pipeline

## Limitations

- The product depends on public job-board availability and the metadata those APIs expose.
- Historical value improves over time as the snapshot table accumulates more daily runs.
- AI summaries are optional and gracefully degrade to deterministic summaries without an API key.
- The local environment used for this scaffold was on Node `18.12.1`; upgrade to `18.18+` before installing dependencies.

## Future Improvements

- Saved watchlists and user accounts
- Email alerts and digests
- Custom competitor cohorts
- More hiring providers beyond Greenhouse and Lever
- Premium API access for export automation
