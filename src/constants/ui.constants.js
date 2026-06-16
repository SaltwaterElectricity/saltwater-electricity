// src/constants/ui.constants.js

/**
 * CHART VISUAL CONFIGURATION
 * Centralized styles for Recharts/Chart.js components.
 */
export const CHART_STYLES = Object.freeze({
  grid: {
    stroke: "#f1f5f9", // slate-100
    strokeDasharray: "3 3",
    vertical: false,
  },
  axis: {
    fontSize: 10,
    fontWeight: 700,
    tickMargin: 10,
    stroke: "#94a3b8", // slate-400
  },
  tooltip: {
    contentStyle: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      border: "1px solid #f1f5f9",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    },
    itemStyle: { fontSize: "12px", fontWeight: 800 },
  },
  line: {
    strokeWidth: 3,
    dotSize: 0,
    activeDotSize: 6,
    tension: 0.4, // Makes the line curvy/smooth
  },
});
