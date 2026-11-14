import type { ReportContent, ReportKind } from "./report";

const COPY: Record<ReportKind, { category: string; title: string; summary: string }> = {
  performance: {
    category: "Performance",
    title: "Revenue Momentum Report",
    summary: "Growth is healthy, but the mix is changing. Expansion revenue is doing more of the heavy lifting while new-business velocity has softened. The strongest near-term opportunity is to protect the segments already converting well and remove friction from the middle of the funnel.",
  },
  retention: {
    category: "Retention",
    title: "Retention & Churn Diagnostic",
    summary: "Retention is stable at the top line, with a clear divide between customers who reach an early activation milestone and those who do not. Churn risk concentrates in the first 60 days. A focused onboarding intervention should create more value than broad discount-led win-back activity.",
  },
  market: {
    category: "Market",
    title: "Market Expansion Brief",
    summary: "The opportunity is attractive where buyer density, partner coverage, and product readiness overlap. A narrow beachhead motion is preferable to a broad regional launch. Start with one high-intent segment, validate willingness to pay, then scale local acquisition only after repeatable conversion emerges.",
  },
};

function subjectFrom(prompt: string) {
  const match = prompt.match(/(?:for|about)\s+([A-Z][\w&-]*(?:\s+[A-Z][\w&-]*){0,1})/);
  return match?.[1]?.replace(/[.,]$/, "") ?? "";
}

export function detectReportKind(prompt: string, requested?: ReportKind | "auto"): ReportKind {
  if (requested && requested !== "auto") return requested;
  const value = prompt.toLowerCase();
  if (/churn|retention|loyalty|cancel|renewal/.test(value)) return "retention";
  if (/market|expand|expansion|competitor|region|europe|asia|launch/.test(value)) return "market";
  return "performance";
}

export function generateReport(prompt: string, requested?: ReportKind | "auto") {
  const kind = detectReportKind(prompt, requested);
  const copy = COPY[kind];
  const subject = subjectFrom(prompt);
  const title = subject ? `${subject} ${copy.title}` : copy.title;

  const contentByKind: Record<ReportKind, ReportContent> = {
    performance: {
      kind,
      executiveSummary: copy.summary,
      metrics: [
        { label: "Revenue run-rate", value: "$4.82M", delta: "+18.4%", trend: "up", note: "vs. prior period" },
        { label: "Net expansion", value: "11.6%", delta: "+2.1 pts", trend: "up", note: "existing accounts" },
        { label: "Sales velocity", value: "38 days", delta: "+4 days", trend: "down", note: "median cycle" },
        { label: "Gross margin", value: "74.2%", delta: "+0.8 pts", trend: "up", note: "after delivery costs" },
      ],
      series: [
        { label: "May", primary: 52, secondary: 46 }, { label: "Jun", primary: 58, secondary: 49 },
        { label: "Jul", primary: 61, secondary: 52 }, { label: "Aug", primary: 57, secondary: 51 },
        { label: "Sep", primary: 72, secondary: 57 }, { label: "Oct", primary: 84, secondary: 63 },
      ],
      segments: [
        { label: "Expansion", value: 46, detail: "Existing customers are the most efficient growth engine." },
        { label: "New business", value: 34, detail: "Healthy volume, with slower mid-funnel progression." },
        { label: "Reactivation", value: 20, detail: "Small but improving contribution from dormant accounts." },
      ],
      insights: [
        { title: "Expansion is carrying the quarter", signal: "positive", detail: "Accounts with two or more active teams show the strongest upgrade behavior and lowest acquisition cost." },
        { title: "The middle of the funnel needs attention", signal: "watch", detail: "Deals spend longer between technical validation and commercial review than they did in the prior period." },
        { title: "Margin improved alongside growth", signal: "neutral", detail: "Delivery efficiency offset higher acquisition spend, keeping overall unit economics resilient." },
      ],
      actions: [
        { title: "Build an expansion trigger list", detail: "Flag accounts reaching 70% seat utilization or adding a second team, then route them to account owners within 24 hours.", impact: "High", effort: "Low" },
        { title: "Add a commercial review checkpoint", detail: "Introduce a standard mutual action plan before technical validation ends to prevent late-stage drift.", impact: "High", effort: "Medium" },
        { title: "Concentrate spend on proven cohorts", detail: "Shift a controlled share of acquisition budget toward the two industries with the shortest payback period.", impact: "Medium", effort: "Medium" },
      ],
      sources: [
        { title: "CRM opportunity snapshot", type: "First-party data", note: "Illustrative pipeline and conversion model" },
        { title: "Billing cohort summary", type: "First-party data", note: "Illustrative revenue and expansion model" },
        { title: "Jimvis growth heuristics", type: "Analysis layer", note: "Comparative signal interpretation" },
      ],
    },
    retention: {
      kind,
      executiveSummary: copy.summary,
      metrics: [
        { label: "Gross retention", value: "91.4%", delta: "+1.8 pts", trend: "up", note: "rolling 90 days" },
        { label: "Early churn", value: "6.8%", delta: "-1.2 pts", trend: "up", note: "first 60 days" },
        { label: "Activation", value: "63.0%", delta: "+5.4 pts", trend: "up", note: "milestone reached" },
        { label: "At-risk MRR", value: "$86K", delta: "+7.0%", trend: "down", note: "needs intervention" },
      ],
      series: [
        { label: "W1", primary: 100, secondary: 100 }, { label: "W2", primary: 88, secondary: 81 },
        { label: "W4", primary: 81, secondary: 68 }, { label: "W8", primary: 77, secondary: 58 },
        { label: "W12", primary: 74, secondary: 51 }, { label: "W16", primary: 72, secondary: 47 },
      ],
      segments: [
        { label: "Activated", value: 63, detail: "Reached a meaningful product milestone in week one." },
        { label: "Drifting", value: 24, detail: "Usage is falling, but the account remains recoverable." },
        { label: "At risk", value: 13, detail: "Low engagement plus a renewal or support signal." },
      ],
      insights: [
        { title: "Week-one activation changes the curve", signal: "positive", detail: "Activated customers retain at a materially higher rate through the full 16-week observation window." },
        { title: "Risk appears before cancellation", signal: "watch", detail: "A decline in weekly active users typically arrives several weeks before the commercial churn event." },
        { title: "Broad discounts are the wrong first move", signal: "neutral", detail: "The largest recoverable cohort needs guidance and habit formation, not a pricing concession." },
      ],
      actions: [
        { title: "Design a five-day activation sprint", detail: "Give every new account one clear milestone, a guided setup path, and a human check-in on day three.", impact: "High", effort: "Medium" },
        { title: "Trigger outreach on usage decline", detail: "Create a save play when weekly activity falls 30% below an account’s own four-week baseline.", impact: "High", effort: "Low" },
        { title: "Close the loop with cancelled accounts", detail: "Code exit reasons consistently and review them with product and customer teams every two weeks.", impact: "Medium", effort: "Low" },
      ],
      sources: [
        { title: "Product activity cohorts", type: "First-party data", note: "Illustrative activation and usage model" },
        { title: "Subscription ledger", type: "First-party data", note: "Illustrative renewal and churn model" },
        { title: "Jimvis retention heuristics", type: "Analysis layer", note: "Leading-indicator interpretation" },
      ],
    },
    market: {
      kind,
      executiveSummary: copy.summary,
      metrics: [
        { label: "Addressable spend", value: "$1.26B", delta: "+9.2%", trend: "up", note: "annual category growth" },
        { label: "Beachhead accounts", value: "2,840", delta: "4 clusters", trend: "steady", note: "high-fit organizations" },
        { label: "Entry readiness", value: "78/100", delta: "Strong", trend: "up", note: "composite score" },
        { label: "Payback target", value: "14 mo", delta: "Within range", trend: "steady", note: "base scenario" },
      ],
      series: [
        { label: "Q1", primary: 22, secondary: 18 }, { label: "Q2", primary: 31, secondary: 24 },
        { label: "Q3", primary: 39, secondary: 31 }, { label: "Q4", primary: 52, secondary: 42 },
        { label: "Q5", primary: 68, secondary: 55 }, { label: "Q6", primary: 82, secondary: 69 },
      ],
      segments: [
        { label: "Nordics", value: 42, detail: "Highest combined buyer density and English-language readiness." },
        { label: "Benelux", value: 35, detail: "Strong partner potential with more competitive intensity." },
        { label: "DACH", value: 23, detail: "Large prize, but localization and procurement raise entry cost." },
      ],
      insights: [
        { title: "A focused wedge beats a regional launch", signal: "positive", detail: "One repeatable segment can produce reference customers before broader localization spend is required." },
        { title: "Partners change the entry economics", signal: "neutral", detail: "Local implementation and advisory partners reduce trust barriers and fixed-cost exposure." },
        { title: "Compliance is a workstream, not a blocker", signal: "watch", detail: "Procurement requirements are manageable if security and data residency materials are prepared before launch." },
      ],
      actions: [
        { title: "Recruit 20 design-partner accounts", detail: "Target one high-fit vertical with a structured pilot, executive sponsor, and agreed success criteria.", impact: "High", effort: "Medium" },
        { title: "Run a two-market pricing test", detail: "Test packaging and willingness to pay with matched cohorts before setting the regional price book.", impact: "High", effort: "Low" },
        { title: "Build the local trust kit", detail: "Prepare security, procurement, customer proof, and implementation materials before scaling paid acquisition.", impact: "Medium", effort: "Medium" },
      ],
      sources: [
        { title: "Category demand model", type: "Market model", note: "Illustrative spend and account estimates" },
        { title: "Competitive landscape scan", type: "Desk research", note: "Illustrative positioning and entry signals" },
        { title: "Jimvis expansion heuristics", type: "Analysis layer", note: "Readiness and scenario interpretation" },
      ],
    },
  };

  return { title, category: copy.category, content: contentByKind[kind] };
}
