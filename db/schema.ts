import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  providerToken: text("provider_token").notNull(),
  websiteUrl: text("website_url").notNull(),
  careersUrl: text("careers_url").notNull(),
  sector: text("sector").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const ingestRuns = pgTable("ingest_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  sourceCount: integer("source_count").default(0).notNull(),
  jobCount: integer("job_count").default(0).notNull(),
  errorCount: integer("error_count").default(0).notNull(),
  errors: jsonb("errors").$type<Record<string, unknown>[]>().default([]).notNull()
});

export const jobsCurrent = pgTable(
  "jobs_current",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),
    providerJobId: text("provider_job_id").notNull(),
    sourceUrl: text("source_url").notNull(),
    title: text("title").notNull(),
    department: text("department"),
    locationText: text("location_text"),
    country: text("country"),
    region: text("region"),
    workplaceType: text("workplace_type"),
    employmentType: text("employment_type"),
    roleFamily: text("role_family").notNull(),
    seniorityBand: text("seniority_band").notNull(),
    isAiRole: boolean("is_ai_role").default(false).notNull(),
    isGtmRole: boolean("is_gtm_role").default(false).notNull(),
    skills: jsonb("skills").$type<string[]>().default([]).notNull(),
    descriptionHash: text("description_hash").notNull(),
    descriptionText: text("description_text"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
    isOpen: boolean("is_open").default(true).notNull()
  },
  (table) => ({
    companyProviderIdx: uniqueIndex("jobs_current_company_provider_idx").on(
      table.companyId,
      table.providerJobId
    ),
    companyOpenIdx: index("jobs_current_company_open_idx").on(table.companyId, table.isOpen)
  })
);

export const jobObservations = pgTable(
  "job_observations",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    runId: uuid("run_id")
      .references(() => ingestRuns.id, { onDelete: "cascade" })
      .notNull(),
    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),
    jobCurrentId: uuid("job_current_id")
      .references(() => jobsCurrent.id, { onDelete: "cascade" })
      .notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).defaultNow().notNull(),
    title: text("title").notNull(),
    locationText: text("location_text"),
    roleFamily: text("role_family").notNull(),
    seniorityBand: text("seniority_band").notNull(),
    isAiRole: boolean("is_ai_role").default(false).notNull(),
    isOpen: boolean("is_open").default(true).notNull()
  },
  (table) => ({
    companyObservedIdx: index("job_observations_company_observed_idx").on(
      table.companyId,
      table.observedAt
    )
  })
);

export const companyDailyMetrics = pgTable(
  "company_daily_metrics",
  {
    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),
    metricDate: date("metric_date").notNull(),
    openJobs: integer("open_jobs").default(0).notNull(),
    newJobs7d: integer("new_jobs_7d").default(0).notNull(),
    closedJobs7d: integer("closed_jobs_7d").default(0).notNull(),
    netNew7d: integer("net_new_7d").default(0).notNull(),
    aiShare: numeric("ai_share", { precision: 8, scale: 4 }).default("0").notNull(),
    gtmShare: numeric("gtm_share", { precision: 8, scale: 4 }).default("0").notNull(),
    leadershipShare: numeric("leadership_share", { precision: 8, scale: 4 }).default("0").notNull(),
    remoteShare: numeric("remote_share", { precision: 8, scale: 4 }).default("0").notNull(),
    locationCount: integer("location_count").default(0).notNull(),
    newLocationCount30d: integer("new_location_count_30d").default(0).notNull(),
    momentumScore: numeric("momentum_score", { precision: 8, scale: 2 }).default("0").notNull(),
    forecast7d: integer("forecast_7d").default(0).notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.companyId, table.metricDate] }),
    metricsDateIdx: index("company_daily_metrics_date_idx").on(table.metricDate, table.momentumScore)
  })
);

export const insightSnapshots = pgTable("insight_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  summaryKind: text("summary_kind").notNull(),
  summaryJson: jsonb("summary_json").$type<Record<string, unknown>>().notNull(),
  groundingJson: jsonb("grounding_json").$type<Record<string, unknown>>().notNull(),
  model: text("model").notNull(),
  usedFallback: boolean("used_fallback").default(false).notNull()
});
