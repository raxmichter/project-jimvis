export type ReportKind = "performance" | "retention" | "market";

export type ReportMetric = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "steady";
  note: string;
};

export type ReportContent = {
  kind: ReportKind;
  executiveSummary: string;
  metrics: ReportMetric[];
  series: { label: string; primary: number; secondary: number }[];
  segments: { label: string; value: number; detail: string }[];
  insights: { title: string; detail: string; signal: "positive" | "watch" | "neutral" }[];
  actions: { title: string; detail: string; impact: string; effort: string }[];
  sources: { title: string; type: string; note: string }[];
};

export const PROMPT_EXAMPLES = [
  {
    label: "Find the revenue story",
    prompt: "Create a revenue performance report for Northstar Labs and explain where growth is accelerating.",
    kind: "performance" as const,
  },
  {
    label: "Understand churn",
    prompt: "Analyze customer retention for my subscription business and recommend ways to reduce churn.",
    kind: "retention" as const,
  },
  {
    label: "Size a new market",
    prompt: "Evaluate a market expansion into Northern Europe for a B2B software company.",
    kind: "market" as const,
  },
];
