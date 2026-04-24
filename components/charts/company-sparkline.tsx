"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

import { chartColors } from "@/components/charts/chart-theme";

export function CompanySparkline({
  data
}: {
  data: Array<{ metricDate: string; openJobs: number }>;
}) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="openJobs"
            stroke={chartColors.primary}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
