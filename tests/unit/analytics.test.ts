import { buildSampleDataset } from "@/data/sample/sample-data";
import { finalizeHistory, buildCohortMetrics } from "@/lib/analytics/metrics";
import { generateAlerts } from "@/lib/analytics/alerts";
import { companyConfig } from "@/lib/company-config";
import type { DailyMetricPoint } from "@/lib/types";

describe("analytics pipeline", () => {
  it("computes a bounded momentum score and alert set", () => {
    const sample = buildSampleDataset();
    const company = companyConfig.find((item) => item.slug === "vercel")!;
    const jobs = sample.jobs.filter((job) => job.companySlug === company.slug);
    const history = sample.history.filter((point) => point.companySlug === company.slug);
    const finalized = finalizeHistory(company, jobs, history);
    const alerts = generateAlerts(company, finalized.current, finalized.history, finalized.functionMix);

    expect(finalized.current.momentumScore).toBeGreaterThanOrEqual(0);
    expect(finalized.current.momentumScore).toBeLessThanOrEqual(100);
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("computes cohort metrics from company metric rows", () => {
    const sample = buildSampleDataset();
    const companyViews = companyConfig.map((company) => {
      const jobs = sample.jobs.filter((job) => job.companySlug === company.slug);
      const history = sample.history.filter((point) => point.companySlug === company.slug);
      const finalized = finalizeHistory(company, jobs, history);
      return {
        company,
        metrics: finalized.current
      };
    });

    const metrics = buildCohortMetrics(companyViews);
    expect(metrics.totalOpenJobs).toBeGreaterThan(0);
    expect(metrics.trackedCompanies).toBe(companyConfig.length);
  });

  it("does not collapse fresh deployments to a flat momentum score when history is shallow", () => {
    const sample = buildSampleDataset();
    const company = companyConfig.find((item) => item.slug === "stripe")!;
    const jobs = sample.jobs.filter((job) => job.companySlug === company.slug);
    const actualPoint = sample.history.filter((point) => point.companySlug === company.slug).at(-1)!;
    const shallowHistory: DailyMetricPoint[] = [actualPoint];
    const finalized = finalizeHistory(company, jobs, shallowHistory);

    expect(finalized.history.length).toBeGreaterThan(1);
    expect(finalized.current.momentumScore).not.toBe(50);
  });
});
