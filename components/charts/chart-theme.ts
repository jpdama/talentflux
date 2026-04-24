export const chartColors = {
  primary: "hsl(178, 88%, 55%)",
  primarySoft: "hsl(178, 88%, 55%, 0.15)",
  accent: "hsl(265, 80%, 72%)",
  warning: "hsl(38, 96%, 60%)",
  success: "hsl(152, 62%, 48%)",
  danger: "hsl(354, 80%, 62%)",
  muted: "hsl(218, 16%, 62%)",
  grid: "hsl(218, 18%, 20%)"
};

export const chartPalette = [
  chartColors.primary,
  chartColors.accent,
  chartColors.warning,
  chartColors.success,
  chartColors.danger,
  "hsl(210, 60%, 70%)"
];

export const tooltipStyle = {
  background: "hsl(222, 28%, 10%)",
  border: "1px solid hsl(218, 18%, 26%)",
  borderRadius: 10,
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6)",
  padding: "8px 12px"
};

export const tooltipItemStyle = { color: "hsl(210, 30%, 92%)", fontSize: 12 };
export const tooltipLabelStyle = {
  color: "hsl(218, 16%, 62%)",
  fontSize: 11,
  fontWeight: 500,
  marginBottom: 4
};

export const axisStyle = {
  stroke: chartColors.muted,
  fontSize: 11,
  fontFamily: "inherit"
};
