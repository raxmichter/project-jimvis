import { motion, useReducedMotion } from "motion/react";
import type { ReportContent } from "@contracts/report";

export function ReportChart({ series, kind = "performance" }: { series: ReportContent["series"]; kind?: string }) {
  const reduceMotion = useReducedMotion();
  const max = Math.max(...series.flatMap((item) => [item.primary, item.secondary]), 100);
  const primaryLabel = kind === "retention" ? "Activated cohort" : kind === "market" ? "Focused entry" : "This period";
  const secondaryLabel = kind === "retention" ? "Baseline cohort" : kind === "market" ? "Broad launch" : "Previous period";

  return (
    <div className="report-chart" aria-label="Comparative performance chart">
      <div className="chart-legend">
        <span><i className="legend-dot legend-dot--primary" />{primaryLabel}</span>
        <span><i className="legend-dot legend-dot--secondary" />{secondaryLabel}</span>
      </div>
      <div className="chart-plot">
        <div className="chart-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        {series.map((item, index) => (
          <div className="chart-group" key={item.label}>
            <div className="chart-bars" aria-label={`${item.label}: ${item.primary} versus ${item.secondary}`}>
              <motion.span
                className="chart-bar chart-bar--primary"
                style={{ height: `${(item.primary / max) * 100}%` }}
                initial={reduceMotion ? false : { scaleY: 0, opacity: 0.4 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.span
                className="chart-bar chart-bar--secondary"
                style={{ height: `${(item.secondary / max) * 100}%` }}
                initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.08 + index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className="chart-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
