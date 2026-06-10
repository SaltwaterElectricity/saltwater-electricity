// src/constants/index.js

export * from "./roles";
export * from "./routes";

// 1. GLOBAL SETTINGS: Control logic thresholds
export const APP_SETTINGS = Object.freeze({
  STALE_THRESHOLD: 30000,
  POLLING_INTERVAL: 10000,
});

// 2. METRIC KEYS: Single source of truth for internal keys
export const METRICS = Object.freeze({
  TDS: "tds",
  VOLTAGE: "voltage",
  CURRENT: "current",
});

// 3. DATABASE MAP: Decouples UI keys from API response keys
export const METRIC_MAP = Object.freeze({
  [METRICS.TDS]: "tds_ppm",
  [METRICS.VOLTAGE]: "voltage",
  [METRICS.CURRENT]: "total_ma",
});

// 4. UI CONFIGURATION: The "Brain" of your UI components
export const METRIC_CONFIG = Object.freeze({
  [METRICS.TDS]: {
    id: METRICS.TDS,
    label: "TDS",
    icon: "💧",
    unit: "ppm",
    chartColor: "#3b82f6",
    colorClass: "text-blue-500",
  },
  [METRICS.VOLTAGE]: {
    id: METRICS.VOLTAGE,
    label: "Voltage",
    icon: "⚡",
    unit: "V",
    chartColor: "#00c1fd",
    colorClass: "text-blue-400",
  },
  [METRICS.CURRENT]: {
    id: METRICS.CURRENT,
    label: "Total Current",
    icon: "🔌",
    unit: "A",
    chartColor: "#22d3ee",
    colorClass: "text-cyan-400",
  },
  DEFAULT: {
    id: "unknown",
    label: "Unknown",
    icon: "❓",
    unit: "",
    chartColor: "#94a3b8",
    colorClass: "text-slate-500",
  },
});

/**
 * 7. CHART VISUAL CONFIGURATION
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

export const SENSOR_CONFIG = Object.freeze({
  [METRICS.TDS]: {
    unit: "PPM",
    icon: "💧",
    min: 0, // Physical Hardware Limit
    max: 1000, // Physical Hardware Limit
    warning: 300, // UI Alert Zone
    critical: 500, // UI Alert Zone
    precision: 0, // TDS usually doesn't need decimals
  },
  [METRICS.VOLTAGE]: {
    unit: "V",
    icon: "⚡",
    min: 0,
    max: 15,
    warning: 3.2,
    critical: 2.8,
    precision: 2,
  },
  [METRICS.CURRENT]: {
    unit: "A",
    icon: "🔌",
    min: 0,
    max: 5, // Estimated limit based on total load
    warning: 3.5,
    critical: 4.5,
    precision: 2,
  },
});
