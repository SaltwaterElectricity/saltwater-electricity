import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_STYLES } from "../../constants";

/**
 * DeviceAnalyticsChart
 * Standardized historical telemetry visualization.
 * Reusable across different metrics (TDS, Temp, Voltage).
 */
const DeviceAnalyticsChart = ({ data = [], metricConfig = {} }) => {
  const chartColor = metricConfig.chartColor || "#3b82f6";

  return (
    <div className="w-full h-full min-h-[300px] font-['Inter']">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray={CHART_STYLES.grid.strokeDasharray} 
            vertical={CHART_STYLES.grid.vertical} 
            stroke={CHART_STYLES.grid.stroke} 
          />
          <XAxis 
            dataKey="timestamp" 
            hide 
          />
          <YAxis 
            hide 
            domain={["auto", "auto"]} 
          />
          <Tooltip
            contentStyle={CHART_STYLES.tooltip.contentStyle}
            itemStyle={{ ...CHART_STYLES.tooltip.itemStyle, color: chartColor }}
            labelFormatter={(label) => new Date(label).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            filter="url(#glow)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceAnalyticsChart;
