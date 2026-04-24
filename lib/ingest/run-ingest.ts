import { desc, eq } from "drizzle-orm";

import { closeDb, getDb, hasDatabase } from "@/db/client";
import {
  companies as companiesTable,
  companyDailyMetrics,
  ingestRuns,
  insightSnapshots,
  jobsCurrent,
  jobObservations
} from "@/db/schema";
import { deterministicSummary, buildFunctionMix, finalizeHistory, topSkills } from "@/lib/analytics/metrics";
import { generateAlerts } from "@/lib/analytics/alerts";
import { generateAiSummary } from "@/lib/ai/generate-summary";
import { companyConfig } from "@/lib/company-config";
import { fetchManyCompanies } from "@/lib/providers";
import type { CanonicalJob, CompanySeed, DailyMetricPoint } from "@/lib/types";

async function upsertJobsForCompany(
  companyId: string,
  companySlug: string,
  jobs: CanonicalJob[],
  runId: string
) {
  const db = getDb();
  const existing = await db.select().from(jobsCurrent).where(eq(jobsCurrent.companyId, companyId));
  const existingMap = new Map(existing.map((row) => [row.providerJobId, row]));
  const openIds = new Set(jobs.map((job) => job.providerJobId));
  const now = new Date();

  for (const job of jobs) {
    const previous = existingMap.get(job.providerJobId);
    const payload = {
      companyId,
      providerJobId: job.providerJobId,
      sourceUrl: job.sourceUrl,
      title: job.title,
      department: job.department,
      locationText: job.locationText,
      country: job.country,
      region: job.region,
      workplaceType: job.workplaceType,
      employmentType: job.employmentType,
      roleFamily: job.roleFamily,
      seniorityBand: job.seniorityBand,
      isAiRole: job.isAiRole,
      isGtmRole: job.isGtmRole,
      skills: job.skills,
      descriptionHash: job.descriptionHash,
      descriptionText: job.descriptionText,
      firstSeenAt: previous?.firstSeenAt ?? new Date(job.firstSeenAt),
      lastSeenAt: now,
      isOpen: true
    };

    if (previous) {
      await db.update(jobsCurrent).set(payload).where(eq(jobsCurrent.id, previous.id));
      await db.insert(jobObservations).values({
        runId,
        companyId,
        jobCurrentId: previous.id,
        observedAt: now,
        title: job.title,
        locationText: job.locationText,
        roleFamily: job.roleFamily,
        seniorityBand: job.seniorityBand,
        isAiRole: job.isAiRole,
        isOpen: true
      });
    } else {
      const [inserted] = await db
        .insert(jobsCurrent)
        .values(payload)
        .returning({ id: jobsCurrent.id });

      await db.insert(jobObservations).values({
        runId,
        companyId,
        jobCurrentId: inserted.id,
        observedAt: now,
        title: job.title,
        locationText: job.locationText,
        roleFamily: job.roleFamily,
        seniorityBand: job.seniorityBand,
        isAiRole: job.isAiRole,
        isOpen: true
      });
    }
  }

  const staleJobs = existing.filter((row) => !openIds.has(row.providerJobId) && row.isOpen);
  if (staleJobs.length) {
    for (const stale of staleJobs) {
      await db
        .update(jobsCurrent)
        .set({
          isOpen: false,
          lastSeenAt: now
        })
        .where(eq(jobsCurrent.id, stale.id));
    }
  }
}

async function loadCompanyHistory(company: CompanySeed & { id: string }) {
  const db = getDb();
  const [jobRows, historyRows] = await Promise.all([
    db.select().from(jobsCurrent).where(eq(jobsCurrent.companyId, company.id)),
    db
      .select()
      .from(companyDailyMetrics)
      .where(eq(companyDailyMetrics.companyId, company.id))
      .orderBy(desc(companyDailyMetrics.metricDate))
      .limit(30)
  ]);

  const jobs: CanonicalJob[] = jobRows.map((row) => ({
    companySlug: company.slug,
    companyName: company.name,
    provider: company.provider,
    providerJobId: row.providerJobId,
    sourceUrl: row.sourceUrl,
    title: row.title,
    department: row.department,
    locationText: row.locationText,
    country: row.country,
    region: row.region,
    workplaceType: row.workplaceType as CanonicalJob["workplaceType"],
    employmentType: row.employmentType,
    roleFamily: row.roleFamily as CanonicalJob["roleFamily"],
    seniorityBand: row.seniorityBand as CanonicalJob["seniorityBand"],
    isAiRole: row.isAiRole,
    isGtmRole: row.isGtmRole,
    skills: row.skills as string[],
    descriptionHash: row.descriptionHash,
    descriptionText: row.descriptionText ?? "",
    firstSeenAt: row.firstSeenAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    isOpen: row.isOpen
  }));

  const history: DailyMetricPoint[] = historyRows
    .map((row) => ({
      companySlug: company.slug,
      metricDate: row.metricDate,
      openJobs: row.openJobs,
      newJobs7d: row.newJobs7d,
      closedJobs7d: row.closedJobs7d,
      netNew7d: row.netNew7d,
      aiShare: Number(row.aiShare),
      gtmShare: Number(row.gtmShare),
      leadershipShare: Number(row.leadershipShare),
      remoteShare: Number(row.remoteShare),
      locationCount: row.locationCount,
      newLocationCount30d: row.newLocationCount30d,
      momentumScore: Number(row.momentumScore),
      forecast7d: row.forecast7d
    }))
    .reverse();

  return { jobs, history };
}

async function upsertMetric(companyId: string, metric: DailyMetricPoint) {
  const db = getDb();
  await db
    .insert(companyDailyMetrics)
    .values({
      companyId,
      metricDate: metric.metricDate,
      openJobs: metric.openJobs,
      newJobs7d: metric.newJobs7d,
      closedJobs7d: metric.closedJobs7d,
      netNew7d: metric.netNew7d,
      aiShare: String(metric.aiShare),
      gtmShare: String(metric.gtmShare),
      leadershipShare: String(metric.leadershipShare),
      remoteShare: String(metric.remoteShare),
      locationCount: metric.locationCount,
      newLocationCount30d: metric.newLocationCount30d,
      momentumScore: String(metric.momentumScore),
      forecast7d: metric.forecast7d
    })
    .onConflictDoUpdate({
      target: [companyDailyMetrics.companyId, companyDailyMetrics.metricDate],
      set: {
        openJobs: metric.openJobs,
        newJobs7d: metric.newJobs7d,
        closedJobs7d: metric.closedJobs7d,
        netNew7d: metric.netNew7d,
        aiShare: String(metric.aiShare),
        gtmShare: String(metric.gtmShare),
        leadershipShare: String(metric.leadershipShare),
        remoteShare: String(metric.remoteShare),
        locationCount: metric.locationCount,
        newLocationCount30d: metric.newLocationCount30d,
        momentumScore: String(metric.momentumScore),
        forecast7d: metric.forecast7d
      }
    });
}

async function upsertSummary(
  companyId: string | null,
  summaryKind: string,
  summary: Record<string, unknown>,
  usedFallback: boolean
) {
  const db = getDb();
  await db.insert(insightSnapshots).values({
    companyId,
    summaryKind,
    summaryJson: summary,
    groundingJson: summary,
    model: usedFallback ? "deterministic" : "openai",
    usedFallback
  });
}

async function generateAndPersistCompanySummary(company: CompanySeed, companyId: string) {
  const { jobs, history } = await loadCompanyHistory({ ...company, id: companyId });
  const { current, history: finalizedHistory, functionMix } = finalizeHistory(company, jobs, history);
  const alerts = generateAlerts(company, current, finalizedHistory, functionMix);
  const fallback = deterministicSummary(
    company.name,
    current,
    alerts.map((alert) => alert.title),
    functionMix,
    topSkills(jobs)
  );

  const aiSummary = await generateAiSummary({
    label: company.name,
    metrics: {
      openJobs: current.openJobs,
      netNew7d: current.netNew7d,
      aiShare: current.aiShare,
      gtmShare: current.gtmShare,
      leadershipShare: current.leadershipShare,
      remoteShare: current.remoteShare,
      forecast7d: current.forecast7d,
      momentumScore: current.momentumScore
    },
    alerts: alerts.map((alert) => alert.title),
    topSkills: topSkills(jobs),
    functionMix: functionMix.map((item) => ({ roleFamily: item.roleFamily, share: item.share }))
  });

  await upsertMetric(companyId, current);
  await upsertSummary(
    companyId,
    "company",
    (aiSummary ?? fallback) as unknown as Record<string, unknown>,
    !aiSummary
  );

  return {
    metrics: current,
    summary: aiSummary ?? fallback,
    usedFallback: !aiSummary
  };
}

export async function runIngest() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is required for ingestion.");
  }

  const db = getDb();
  const [run] = await db
    .insert(ingestRuns)
    .values({
      status: "running",
      sourceCount: companyConfig.length,
      jobCount: 0,
      errorCount: 0
    })
    .returning({ id: ingestRuns.id });

  try {
    const companies = await db.select().from(companiesTable).where(eq(companiesTable.isActive, true));
    const normalizedCompanies = companies.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      provider: row.provider,
      providerToken: row.providerToken,
      websiteUrl: row.websiteUrl,
      careersUrl: row.careersUrl,
      sector: row.sector,
      isActive: row.isActive
    })) as Array<CompanySeed & { id: string }>;

    const { jobs, errors } = await fetchManyCompanies(normalizedCompanies);
    const jobsByCompany = normalizedCompanies.reduce<Record<string, CanonicalJob[]>>((accumulator, company) => {
      accumulator[company.slug] = jobs.filter((job) => job.companySlug === company.slug);
      return accumulator;
    }, {});

    for (const company of normalizedCompanies) {
      await upsertJobsForCompany(company.id, company.slug, jobsByCompany[company.slug] ?? [], run.id);
    }

    const summaries = [];
    for (const company of normalizedCompanies) {
      summaries.push(await generateAndPersistCompanySummary(company, company.id));
    }

    await upsertSummary(
      null,
      "cohort",
      deterministicSummary(
        "Tracked cohort",
        {
          companySlug: "cohort",
          metricDate: new Date().toISOString().slice(0, 10),
          openJobs: summaries.reduce((sum, item) => sum + item.metrics.openJobs, 0),
          newJobs7d: summaries.reduce((sum, item) => sum + item.metrics.newJobs7d, 0),
          closedJobs7d: summaries.reduce((sum, item) => sum + item.metrics.closedJobs7d, 0),
          netNew7d: summaries.reduce((sum, item) => sum + item.metrics.netNew7d, 0),
          aiShare: summaries.reduce((sum, item) => sum + item.metrics.aiShare, 0) / Math.max(summaries.length, 1),
          gtmShare: summaries.reduce((sum, item) => sum + item.metrics.gtmShare, 0) / Math.max(summaries.length, 1),
          leadershipShare:
            summaries.reduce((sum, item) => sum + item.metrics.leadershipShare, 0) / Math.max(summaries.length, 1),
          remoteShare: summaries.reduce((sum, item) => sum + item.metrics.remoteShare, 0) / Math.max(summaries.length, 1),
          locationCount: 0,
          newLocationCount30d: summaries.reduce((sum, item) => sum + item.metrics.newLocationCount30d, 0),
          momentumScore: summaries.reduce((sum, item) => sum + item.metrics.momentumScore, 0) / Math.max(summaries.length, 1),
          forecast7d: summaries.reduce((sum, item) => sum + item.metrics.forecast7d, 0)
        },
        [],
        buildFunctionMix(jobs),
        [...new Set(jobs.flatMap((job) => job.skills))].slice(0, 5)
      ) as unknown as Record<string, unknown>,
      true
    );

    await db
      .update(ingestRuns)
      .set({
        status: errors.length ? "completed_with_errors" : "completed",
        finishedAt: new Date(),
        jobCount: jobs.length,
        errorCount: errors.length,
        errors
      })
      .where(eq(ingestRuns.id, run.id));

    return {
      runId: run.id,
      jobs: jobs.length,
      errors
    };
  } catch (error) {
    await db
      .update(ingestRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        errorCount: 1,
        errors: [
          {
            error: error instanceof Error ? error.message : "Unknown ingest failure"
          }
        ]
      })
      .where(eq(ingestRuns.id, run.id));
    throw error;
  } finally {
    await closeDb();
  }
}
