CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "provider" text NOT NULL,
  "provider_token" text NOT NULL,
  "website_url" text NOT NULL,
  "careers_url" text NOT NULL,
  "sector" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ingest_runs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "finished_at" timestamptz,
  "status" text NOT NULL,
  "source_count" integer NOT NULL DEFAULT 0,
  "job_count" integer NOT NULL DEFAULT 0,
  "error_count" integer NOT NULL DEFAULT 0,
  "errors" jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS "jobs_current" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "provider_job_id" text NOT NULL,
  "source_url" text NOT NULL,
  "title" text NOT NULL,
  "department" text,
  "location_text" text,
  "country" text,
  "region" text,
  "workplace_type" text,
  "employment_type" text,
  "role_family" text NOT NULL,
  "seniority_band" text NOT NULL,
  "is_ai_role" boolean NOT NULL DEFAULT false,
  "is_gtm_role" boolean NOT NULL DEFAULT false,
  "skills" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "description_hash" text NOT NULL,
  "description_text" text,
  "first_seen_at" timestamptz NOT NULL,
  "last_seen_at" timestamptz NOT NULL,
  "is_open" boolean NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS "jobs_current_company_provider_idx"
  ON "jobs_current" ("company_id", "provider_job_id");

CREATE INDEX IF NOT EXISTS "jobs_current_company_open_idx"
  ON "jobs_current" ("company_id", "is_open");

CREATE TABLE IF NOT EXISTS "job_observations" (
  "id" bigserial PRIMARY KEY,
  "run_id" uuid NOT NULL REFERENCES "ingest_runs"("id") ON DELETE CASCADE,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "job_current_id" uuid NOT NULL REFERENCES "jobs_current"("id") ON DELETE CASCADE,
  "observed_at" timestamptz NOT NULL DEFAULT now(),
  "title" text NOT NULL,
  "location_text" text,
  "role_family" text NOT NULL,
  "seniority_band" text NOT NULL,
  "is_ai_role" boolean NOT NULL DEFAULT false,
  "is_open" boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS "job_observations_company_observed_idx"
  ON "job_observations" ("company_id", "observed_at");

CREATE TABLE IF NOT EXISTS "company_daily_metrics" (
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "metric_date" date NOT NULL,
  "open_jobs" integer NOT NULL DEFAULT 0,
  "new_jobs_7d" integer NOT NULL DEFAULT 0,
  "closed_jobs_7d" integer NOT NULL DEFAULT 0,
  "net_new_7d" integer NOT NULL DEFAULT 0,
  "ai_share" numeric(8,4) NOT NULL DEFAULT 0,
  "gtm_share" numeric(8,4) NOT NULL DEFAULT 0,
  "leadership_share" numeric(8,4) NOT NULL DEFAULT 0,
  "remote_share" numeric(8,4) NOT NULL DEFAULT 0,
  "location_count" integer NOT NULL DEFAULT 0,
  "new_location_count_30d" integer NOT NULL DEFAULT 0,
  "momentum_score" numeric(8,2) NOT NULL DEFAULT 0,
  "forecast_7d" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("company_id", "metric_date")
);

CREATE INDEX IF NOT EXISTS "company_daily_metrics_date_idx"
  ON "company_daily_metrics" ("metric_date", "momentum_score");

CREATE TABLE IF NOT EXISTS "insight_snapshots" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "company_id" uuid REFERENCES "companies"("id") ON DELETE CASCADE,
  "generated_at" timestamptz NOT NULL DEFAULT now(),
  "summary_kind" text NOT NULL,
  "summary_json" jsonb NOT NULL,
  "grounding_json" jsonb NOT NULL,
  "model" text NOT NULL,
  "used_fallback" boolean NOT NULL DEFAULT false
);
