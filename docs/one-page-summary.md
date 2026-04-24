# TalentFlux — One-Page Summary

**Live dashboard:** https://talentpulse-psi.vercel.app
**Source code:** https://github.com/jpdama/talentflux

## Purpose and Functionality

TalentFlux is a public competitive-hiring intelligence dashboard for AI and software companies. It ingests live job postings from Greenhouse and Lever, normalizes and classifies them (role family, seniority, AI vs. GTM, geography), stores daily snapshots in Postgres, and turns the raw feed into decision-ready signals: AI hiring share, geographic expansion, leadership build-out, and momentum rankings.

The product ships with a live dashboard, per-company drill-down pages, sortable and paginated tables, trend and mix charts, CSV export, a methodology page, and grounded AI summaries (with a deterministic fallback). Data refreshes automatically every four hours via GitHub Actions and can be refreshed on demand from the UI.

## Target Audience

**Who they are.** Founders, competitive-intelligence analysts, VC and growth-equity investors, recruiting leaders, and GTM / strategy operators at software companies.

**How they use it.** They open the dashboard to answer time-sensitive questions — *Who is hiring fastest in AI this quarter? Which competitor is building enterprise sales capacity in Europe? Is Company X quietly standing up a new region?* — filter by role, geography, and timeframe, then drill into a specific company or export the slice for their own deck or brief.

**Why over alternatives.** Generic job boards show listings but not signal; manual spreadsheet tracking is brittle and stale within a day; enterprise HR-intelligence platforms (LinkedIn Talent Insights, Revelio, Draup) are powerful but priced for large enterprises and slow to access. TalentFlux sits in between: automated collection and classification of public data, a structured intelligence workflow, and a price point approachable for individual operators and small teams.

## Sales Pitch and Monetization

**To whom it generates value.** (1) Competitive-intel and strategy teams who need earlier signal than press releases; (2) investors doing diligence or portfolio monitoring on private AI/SaaS companies; (3) recruiting leaders benchmarking their own hiring mix against competitors; (4) sales and GTM teams prospecting companies that are visibly scaling.

**How it monetizes.** Freemium SaaS. The public tier showcases a curated cohort and delayed alerts — enough to drive signups and SEO. Paid tiers unlock: private watchlists and custom cohorts, full historical depth, scheduled email digests and Slack alerts, CSV/API export automation, benchmarking against peer sets, and priority ingest cadence. Enterprise adds SSO, audit log, and dedicated onboarding. Typical pricing: Pro at ~$49/mo per seat, Team at ~$299/mo for shared watchlists, Enterprise via annual contract.

**Why now.** Hiring data is one of the earliest public signals of strategic direction, and AI-era reorganizations are happening faster than quarterly earnings can describe them. TalentFlux turns that signal into an always-on, low-friction workflow.
