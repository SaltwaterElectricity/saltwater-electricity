import { useMemo } from "react";
import { generateSVGPath } from "../../utils/chartUtils";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * GlowLineChart Component
 * Dynamic telemetry visualization inspired by code3.html.
 * Maps historical data points to SVG path coordinates.
 */
const GlowLineChart = ({ type = "voltage", status = "Online", history = [] }) => {
  const config = useMemo(() => {
    const isWarning = status === "Warning";
    // 1. DATA MAPPING: Identify range and generate path
    const metricId = type === "voltage" ? METRICS.VOLTAGE : METRICS.TDS;
    const range = SENSOR_CONFIG[metricId] || { min: 0, max: 100 };

    // Extract last 10 points, ensuring numeric stability
    const dataPoints = history
      .map((log) => {
        const val = type === "voltage" ? log.voltage : (log.tds ?? log.tds_ppm);
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      })
      .filter((val) => val !== null); // Remove malformed data to keep path clean

    const path = generateSVGPath(dataPoints.length > 0 ? dataPoints : [0], range);

    // 2. VISUAL STYLES: Map colors and gradients from code3.html
    const baseColors = {
      voltage: {
        stroke: isWarning ? "#ba1a1a" : "#00c1fd", // Override to red if warning
        gradientId: isWarning ? "red-gradient" : "blue-gradient",
        glow: isWarning ? "rgba(186,26,26,0.3)" : "rgba(0,193,253,0.3)",
      },
      salinity: {
        stroke: "#00e0b8", // Seafoam
        gradientId: "teal-gradient",
        glow: "rgba(0,224,184,0.3)",
      },
    };

    return {
      ...(baseColors[type] || baseColors.voltage),
      path,
    };
  }, [type, status, history]);

  return (
    <div className="w-24 h-10">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
        <defs>
          <linearGradient id={config.gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={config.stroke} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Glow Line Path */}
        <path
          className="transition-all duration-700 ease-in-out"
          d={config.path}
          fill="none"
          stroke={config.stroke}
          strokeLinecap="round"
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 2px 4px ${config.glow})` }}
        />

        {/* Area Fill Gradient */}
        <path
          className="transition-all duration-700 ease-in-out"
          d={`${config.path} V40 H0 Z`}
          fill={`url(#${config.gradientId})`}
          opacity="0.1"
        />
      </svg>
    </div>
  );
};

export default GlowLineChart;
