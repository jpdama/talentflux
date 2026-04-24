import type { DailyMetricPoint, FunctionMixItem } from "@/lib/types";

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  if (values.length < 2) return 1;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance) || 1;
}

function zScore(value: number, values: number[]) {
  return (value - average(values)) / standardDeviation(values);
}

export function scoreMomentum(current: DailyMetricPoint, history: DailyMetricPoint[], functionMix: FunctionMixItem[]) {
  const baseline = history.slice(-28);
  const netNewZ = zScore(current.netNew7d, baseline.map((point) => point.netNew7d));
  const aiDelta = current.aiShare - (baseline.at(-8)?.aiShare ?? baseline[0]?.aiShare ?? current.aiShare);
  const gtmDelta = current.gtmShare - (baseline.at(-8)?.gtmShare ?? baseline[0]?.gtmShare ?? current.gtmShare);
  const newLocationZ = zScore(
    current.newLocationCount30d,
    baseline.map((point) => point.newLocationCount30d)
  );
  const leadershipDelta =
    current.leadershipShare -
    (baseline.at(-8)?.leadershipShare ?? baseline[0]?.leadershipShare ?? current.leadershipShare);
  const concentrationPenalty = Math.max(0, (functionMix[0]?.share ?? 0) - 0.55) * 25;

  const raw =
    50 +
    11 * (0.35 * netNewZ + 0.2 * aiDelta * 5 + 0.15 * gtmDelta * 5 + 0.15 * newLocationZ + 0.15 * leadershipDelta * 5) -
    concentrationPenalty;

  return Math.max(0, Math.min(100, Math.round(raw)));
}
