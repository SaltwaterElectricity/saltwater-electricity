/**
 * src/constants/index.js
 * Centralized configuration for the SMARTAQUA Dashboard.
 */

// 1. GLOBAL SETTINGS: Control logic thresholds
export const APP_SETTINGS = Object.freeze({
  STALE_THRESHOLD: 30000, 
  POLLING_INTERVAL: 10000,
});

// 2. METRIC KEYS: Single source of truth for internal keys
export const METRICS = Object.freeze({
  TDS: 'tds',
  TEMP: 'temp'
});

// 3. DATABASE MAP: Decouples UI keys from API response keys
export const METRIC_MAP = Object.freeze({
  [METRICS.TDS]: 'tds_ppm',
  [METRICS.TEMP]: 'water_temp',
});

// 4. UI CONFIGURATION: The "Brain" of your UI components
export const METRIC_CONFIG = Object.freeze({
  [METRICS.TDS]: { 
    id: METRICS.TDS, // FIXED TYPO: Removed .TRICS
    label: 'TDS', 
    icon: '💧', 
    unit: 'ppm', 
    chartColor: '#3b82f6', 
    colorClass: 'text-blue-500' 
  },
  [METRICS.TEMP]: { 
    id: METRICS.TEMP, 
    label: 'Temp', 
    icon: '🌡️', 
    unit: '°C', 
    chartColor: '#f43f5e', 
    colorClass: 'text-rose-500' 
  },
  DEFAULT: {
    id: 'unknown',
    label: 'Unknown',
    icon: '❓',
    unit: '',
    chartColor: '#94a3b8',
    colorClass: 'text-slate-500'
  }
});

// 5. SAFETY STATES: Defensive programming for loading/error states
export const EMPTY_STATE = Object.freeze({
  data: [],
  hasData: false,
  stats: { current: 0, avg: 0, min: 0, max: 0, trendValue: 0, isRising: false }
});

// 6. UTILITIES & THEME
export const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', { 
  hour: '2-digit', 
  minute: '2-digit', 
  hour12: false 
});

export const STATUS_COLORS = Object.freeze({
  up: 'text-emerald-500 bg-emerald-50',
  down: 'text-rose-500 bg-rose-50',
  stable: 'text-slate-400 bg-slate-50'
});

export const TIME_RANGES = Object.freeze([
  { label: '1H', value: 1 },
  { label: '6H', value: 6 },
  { label: '24H', value: 24 },
  { label: '7D', value: 168 },
]);

/**
 * 7. CHART VISUAL CONFIGURATION
 * Centralized styles for Recharts/Chart.js components.
 */
export const CHART_STYLES = Object.freeze({
  grid: {
    stroke: '#f1f5f9', // slate-100
    strokeDasharray: '3 3',
    vertical: false
  },
  axis: {
    fontSize: 10,
    fontWeight: 700,
    tickMargin: 10,
    stroke: '#94a3b8', // slate-400
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    },
    itemStyle: { fontSize: '12px', fontWeight: 800 }
  },
  line: {
    strokeWidth: 3,
    dotSize: 0,
    activeDotSize: 6,
    tension: 0.4 // Makes the line curvy/smooth
  }
});

/**
 * 8. SENSOR OPERATIONAL CONFIGURATION
 * Defines technical thresholds and safety limits for the hardware.
 */
// src/constants/index.js

export const SENSOR_CONFIG = Object.freeze({
  [METRICS.TDS]: {
    unit: 'PPM',
    icon: '💧',
    min: 0,           // Physical Hardware Limit
    max: 1000,        // Physical Hardware Limit
    warning: 300,     // UI Alert Zone
    critical: 500,    // UI Alert Zone
    precision: 0      // TDS usually doesn't need decimals
  },
  [METRICS.TEMP]: {
    unit: '°C',
    icon: '🌡️',
    min: 0,
    max: 50,
    warning: 28,
    critical: 32,
    precision: 1      // Temp needs one decimal (e.g., 25.4°C)
  }
});

