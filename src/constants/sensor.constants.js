// src/constants/sensor.constants.js

// 1. METRIC KEYS: Single source of truth for internal keys
export const METRICS = Object.freeze({
  TDS: "tds",
  VOLTAGE: "voltage",
  CURRENT: "current",
});

// 2. DATABASE MAP: Decouples UI keys from API response keys
export const METRIC_MAP = Object.freeze({
  [METRICS.TDS]: "tds_ppm",
  [METRICS.VOLTAGE]: "voltage",
  [METRICS.CURRENT]: "total_ma",
});

// 3. UI CONFIGURATION: The "Brain" of your UI components
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

export const SENSOR_CONFIG = Object.freeze({
  [METRICS.TDS]: {
    unit: "PPM",
    icon: "💧",
    min: 0, // Physical Hardware Limit
    max: 1000, // Physical Hardware Limit
    warning: 300, // UI Alert Zone (High)
    critical: 500, // UI Alert Zone (High)
    lowWarning: 100, // Hardware Basis: Electrolyte weakening
    lowCritical: 50, // Hardware Basis: Minimum ions for electricity
    precision: 0, // TDS usually doesn't need decimals
  },
  [METRICS.VOLTAGE]: {
    unit: "V",
    icon: "⚡",
    min: 0,
    max: 300, // Headroom for 220V-240V systems
    warning: 210, // Standard threshold for brownout/overvoltage alerts
    critical: 200,
    lowWarning: 2.5, // Hardware Basis: Low Power
    lowCritical: 1.5, // Hardware Basis: Battery Exhausted
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
