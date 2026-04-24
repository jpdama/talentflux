import { addDays, formatISO, isAfter, isBefore, parseISO, subDays } from "date-fns";

import { isLeadershipRole } from "@/lib/analytics/classify";
import { scoreMomentum } from "@/lib/analytics/scoring";
import type {
  CanonicalJob,
  CompanySeed,
  CohortMetrics,
  DailyMetricPoint,
  FunctionMixItem,
  GroundedSummary
} from "@/lib/types";

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function share(count: number, total: number) {
  return total === 0 ? 0 : Number((count / total).toFixed(4));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function linearForecast(history: DailyMetricPoint[]) {
  const points = history.slice(-14);
  if (points.length < 5) return points.at(-1)?.openJobs ?? 0;

  const xAvg = average(points.map((_, index) => index));
  const yAvg = average(points.map((point) => point.openJobs));
  let numerator = 0;
  let denominator = 0;

  points.forEach((point, index) => {
    numerator += (index - xAvg) * (point.openJobs - yAvg);
    denominator += (index - xAvg) ** 2;
  });

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const forecast = points.at(-1)!.openJobs + slope * 7;
  return Math.max(0, Math.round(forecast));
}

export function buildFunctionMix(jobs: CanonicalJob[]): FunctionMixItem[] {
  const openJobs = jobs.filter((job) => job.isOpen);
  const total = openJobs.length || 1;
  const counts = openJobs.reduce<Record<string, number>>((accumulator, job) => {
    accumulator[job.roleFamily] = (accumulator[job.roleFamily] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([roleFamily, count]) => ({
      roleFamily: roleFamily as FunctionMixItem["roleFamily"],
      count,
      share: Number((count / total).toFixed(4))
    }))
    .sort((left, right) => right.count - left.count);
}

export function topSkills(jobs: CanonicalJob[]) {
  const counts = jobs
    .filter((job) => job.isOpen)
    .flatMap((job) => job.skills)
    .reduce<Record<string, number>>((accumulator, skill) => {
      accumulator[skill] = (accumulator[skill] ?? 0) + 1;
      return accumulator;
    }, {});

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([skill]) => skill);
}

export function buildSyntheticHistory(company: CompanySeed, jobs: CanonicalJob[], days = 30): DailyMetricPoint[] {
  const openJobs = jobs.filter((job) => job.isOpen);
  const aiShareCurrent = share(openJobs.filter((job) => job.isAiRole).length, openJobs.length);
  const gtmShareCurrent = share(openJobs.filter((job) => job.isGtmRole).length, openJobs.length);
  const leadershipShareCurrent = share(openJobs.filter(isLeadershipRole).length, openJobs.length);
  const remoteShareCurrent = share(openJobs.filter((job) => job.workplaceType === "remote").length, openJobs.length);
  const locations = unique(openJobs.map((job) => job.locationText).filter(Boolean)) as string[];
  const start = subDays(new Date(), days - 1);

  return Array.from({ length: days }, (_, index) => {
    const metricDate = addDays(start, index);
    const visibleJobs = openJobs.filter((job) => !isAfter(parseISO(job.firstSeenAt), metricDate));
    const count = Math.max(0, visibleJobs.length);

    return {
      companySlug: company.slug,
      metricDate: formatISO(metricDate, { representation: "date" }),
      openJobs: count,
      newJobs7d: visibleJobs.filter((job) => isAfter(parseISO(job.firstSeenAt), subDays(metricDate, 7))).length,
      closedJobs7d: 0,
      netNew7d: visibleJobs.filter((job) => isAfter(parseISO(job.firstSeenAt), subDays(metricDate, 7))).length,
      aiShare: aiShareCurrent,
      gtmShare: gtmShareCurrent,
      leadershipShare: leadershipShareCurrent,
      remoteShare: remoteShareCurrent,
      locationCount: locations.length,
      newLocationCount30d: unique(
        visibleJobs
          .filter((job) => isAfter(parseISO(job.firstSeenAt), subDays(metricDate, 30)))
          .map((job) => job.locationText)
          .filter(Boolean)
      ).length,
      momentumScore: 0,
      forecast7d: count
    };
  });
}

function mergeHistoryPoints(baseHistory: DailyMetricPoint[], overrides: DailyMetricPoint[]) {
  const merged = new Map(baseHistory.map((point) => [point.metricDate, point]));

  overrides.forEach((point) => {
    const existing = merged.get(point.metricDate);
    merged.set(point.metricDate, existing ? { ...existing, ...point } : point);
  });

  return [...merged.values()].sort((left, right) => left.metricDate.localeCompare(right.metricDate));
}

function bootstrapHistory(company: CompanySeed, jobs: CanonicalJob[], history: DailyMetricPoint[]) {
  const recentHistory = history
    .slice(-30)
    .sort((left, right) => left.metricDate.localeCompare(right.metricDate));

  if (recentHistory.length >= 14) {
    return recentHistory;
  }

  return mergeHistoryPoints(buildSyntheticHistory(company, jobs, 30), recentHistory).slice(-30);
}

export function buildCurrentMetric(company: CompanySeed, jobs: CanonicalJob[], history: DailyMetricPoint[]) {
  const now = new Date();
  const openJobs = jobs.filter((job) => job.isOpen);
  const closedRecent = jobs.filter(
    (job) => !job.isOpen && isAfter(parseISO(job.lastSeenAt), subDays(now, 7)) && isBefore(parseISO(job.lastSeenAt), addDays(now, 1))
  );
  const newJobs7d = jobs.filter((job) => isAfter(parseISO(job.firstSeenAt), subDays(now, 7))).length;
  const locationCount = unique(openJobs.map((job) => job.locationText).filter(Boolean)).length;
  const newLocationCount30d = unique(
    jobs
      .filter((job) => isAfter(parseISO(job.firstSeenAt), subDays(now, 30)))
      .map((job) => job.locationText)
      .filter(Boolean)
  ).length;

  const metric: DailyMetricPoint = {
    companySlug: company.slug,
    metricDate: formatISO(now, { representation: "date" }),
    openJobs: openJobs.length,
    newJobs7d,
    closedJobs7d: closedRecent.length,
    netNew7d: newJobs7d - closedRecent.length,
    aiShare: share(openJobs.filter((job) => job.isAiRole).length, openJobs.length),
    gtmShare: share(openJobs.filter((job) => job.isGtmRole).length, openJobs.length),
    leadershipShare: share(openJobs.filter(isLeadershipRole).length, openJobs.length),
    remoteShare: share(openJobs.filter((job) => job.workplaceType === "remote").length, openJobs.length),
    locationCount,
    newLocationCount30d,
    momentumScore: 0,
    forecast7d: linearForecast(history)
  };

  return metric;
}

export function finalizeHistory(company: CompanySeed, jobs: CanonicalJob[], history: DailyMetricPoint[]) {
  const baseHistory = bootstrapHistory(company, jobs, history);
  const currentMetric = buildCurrentMetric(company, jobs, baseHistory);
  const replaced = [...baseHistory];

  if (replaced.length) {
    replaced[replaced.length - 1] = {
      ...replaced[replaced.length - 1],
      ...currentMetric
    };
  } else {
    replaced.push(currentMetric);
  }

  const functionMix = buildFunctionMix(jobs);
  const scoredCurrent = {
    ...currentMetric,
    momentumScore: scoreMomentum(currentMetric, replaced, functionMix)
  };

  replaced[replaced.length - 1] = scoredCurrent;

  return {
    history: replaced,
    current: scoredCurrent,
    functionMix
  };
}

export function buildCohortTrend(companyHistories: DailyMetricPoint[][]) {
  const bucket = new Map<string, { openJobs: number; aiShareSum: number; aiShareCount: number }>();

  companyHistories.forEach((history) => {
    history.forEach((point) => {
      const existing = bucket.get(point.metricDate) ?? {
        openJobs: 0,
        aiShareSum: 0,
        aiShareCount: 0
      };

      existing.openJobs += point.openJobs;
      existing.aiShareSum += point.aiShare;
      existing.aiShareCount += 1;
      bucket.set(point.metricDate, existing);
    });
  });

  return [...bucket.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([metricDate, value]) => ({
      metricDate,
      openJobs: value.openJobs,
      aiShare: Number((value.aiShareSum / Math.max(value.aiShareCount, 1)).toFixed(4))
    }));
}

export function buildCohortMetrics(companyViews: Array<{ company: CompanySeed; metrics: DailyMetricPoint }>): CohortMetrics {
  const totalOpenJobs = companyViews.reduce((sum, view) => sum + view.metrics.openJobs, 0);
  const topMomentum = companyViews.sort((left, right) => right.metrics.momentumScore - left.metrics.momentumScore)[0];

  return {
    totalOpenJobs,
    netNew7d: companyViews.reduce((sum, view) => sum + view.metrics.netNew7d, 0),
    avgAiShare: Number(average(companyViews.map((view) => view.metrics.aiShare)).toFixed(4)),
    avgRemoteShare: Number(average(companyViews.map((view) => view.metrics.remoteShare)).toFixed(4)),
    trackedCompanies: companyViews.length,
    topMomentumCompany: topMomentum?.company.name ?? "None"
  };
}

export function deterministicSummary(
  label: string,
  metrics: DailyMetricPoint,
  alerts: string[],
  functionMix: FunctionMixItem[],
  topSkills: string[]
): GroundedSummary {
  const leadingFamily = functionMix[0];

  return {
    headline: `${label} has ${metrics.openJobs} open roles with a ${metrics.momentumScore}/100 hiring momentum score.`,
    bullets: [
      `${Math.round(metrics.aiShare * 100)}% of visible openings map to AI / Data roles.`,
      `${metrics.newJobs7d} new roles appeared in the last 7 days across ${metrics.locationCount} active hiring locations.`,
      leadingFamily
        ? `${Math.round(leadingFamily.share * 100)}% of current hiring is concentrated in ${leadingFamily.roleFamily}.`
        : "Hiring is currently balanced across multiple functions."
    ],
    watchItem:
      alerts[0] ??
      (topSkills[0]
        ? `Watch how demand for ${topSkills[0]} evolves over the next refresh cycle.`
        : "Watch whether current hiring momentum converts into broader function diversification."),
    evidence: [
      `Net new roles (7d): ${metrics.netNew7d}`,
      `Forecast open roles (7d): ${metrics.forecast7d}`,
      `Remote share: ${Math.round(metrics.remoteShare * 100)}%`
    ],
    usedFallback: true
  };
}
