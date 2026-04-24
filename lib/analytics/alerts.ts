import type { CompanySeed, DailyMetricPoint, FunctionMixItem, InsightAlert } from "@/lib/types";

function severity(score: number) {
  if (score >= 0.8) return "high" as const;
  if (score >= 0.45) return "medium" as const;
  return "low" as const;
}

export function generateAlerts(
  company: CompanySeed,
  current: DailyMetricPoint,
  history: DailyMetricPoint[],
  functionMix: FunctionMixItem[]
): InsightAlert[] {
  const alerts: InsightAlert[] = [];
  const previousWeek = history.at(-8);
  const aiDelta = current.aiShare - (previousWeek?.aiShare ?? 0);
  const gtmDelta = current.gtmShare - (previousWeek?.gtmShare ?? 0);
  const leadershipDelta = current.leadershipShare - (previousWeek?.leadershipShare ?? 0);
  const topFamily = functionMix[0];

  if (current.aiShare >= 0.2 && aiDelta >= 0.06 && current.newJobs7d >= 2) {
    alerts.push({
      id: `${company.slug}-ai-buildout`,
      companySlug: company.slug,
      companyName: company.name,
      type: "AI Buildout",
      severity: severity(aiDelta + current.newJobs7d / 10),
      title: `${company.name} is accelerating AI hiring`,
      description: `${Math.round(current.aiShare * 100)}% of visible roles now map to AI / Data, with ${current.newJobs7d} new roles in the last week.`,
      reason: `AI share rose ${(aiDelta * 100).toFixed(1)} points week over week.`
    });
  }

  if (current.gtmShare >= 0.22 && gtmDelta >= 0.05 && current.newJobs7d >= 2) {
    alerts.push({
      id: `${company.slug}-gtm-expansion`,
      companySlug: company.slug,
      companyName: company.name,
      type: "GTM Expansion",
      severity: severity(gtmDelta + current.newJobs7d / 10),
      title: `${company.name} is scaling GTM coverage`,
      description: `${Math.round(current.gtmShare * 100)}% of open roles are now revenue-facing or customer-facing.`,
      reason: `GTM share increased ${(gtmDelta * 100).toFixed(1)} points versus the previous week.`
    });
  }

  if (current.newLocationCount30d >= 2) {
    alerts.push({
      id: `${company.slug}-geo-expansion`,
      companySlug: company.slug,
      companyName: company.name,
      type: "Geo Expansion",
      severity: severity(current.newLocationCount30d / 3),
      title: `${company.name} is opening new geographic lanes`,
      description: `${current.newLocationCount30d} new locations appeared in the last 30 days.`,
      reason: `This suggests experimentation with new hiring hubs or regional commercial coverage.`
    });
  }

  if (current.leadershipShare >= 0.14 && leadershipDelta >= 0) {
    alerts.push({
      id: `${company.slug}-leadership-hiring`,
      companySlug: company.slug,
      companyName: company.name,
      type: "Leadership Hiring",
      severity: severity(current.leadershipShare),
      title: `${company.name} is adding leadership capacity`,
      description: `${Math.round(current.leadershipShare * 100)}% of open roles are director-or-manager level.`,
      reason: `Leadership hiring usually signals team formation, market expansion, or post-productization scaling.`
    });
  }

  if (current.netNew7d < 0 || current.closedJobs7d > current.newJobs7d) {
    alerts.push({
      id: `${company.slug}-cooldown`,
      companySlug: company.slug,
      companyName: company.name,
      type: "Hiring Cooldown",
      severity: severity(Math.abs(current.netNew7d) / 5),
      title: `${company.name} shows a hiring cooldown`,
      description: `${current.closedJobs7d} roles closed against ${current.newJobs7d} new roles in the last 7 days.`,
      reason: `Net-new hiring is negative, suggesting pacing or prioritization changes.`
    });
  }

  if (topFamily && topFamily.share >= 0.55) {
    alerts.push({
      id: `${company.slug}-concentration`,
      companySlug: company.slug,
      companyName: company.name,
      type: "Concentration Risk",
      severity: severity(topFamily.share),
      title: `${company.name} is highly concentrated in ${topFamily.roleFamily}`,
      description: `${Math.round(topFamily.share * 100)}% of visible roles sit in one function.`,
      reason: `That concentration can mean focused execution, but it also increases dependence on one strategic bet.`
    });
  }

  return alerts;
}
