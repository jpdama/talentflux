"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function CompanySparkline({
  data
}: {
  data: Array<{ metricDate: string; openJobs: number }>;
}) {
  return (
    <div className="h-16 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="openJobs" stroke="#22d3ee" strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
