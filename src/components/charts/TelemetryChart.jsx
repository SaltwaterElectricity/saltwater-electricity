import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CHART_STYLES } from '../../constants';

/**
 * TELEMETRY CHART COMPONENT
 * Final Integration: Purely configuration-driven.
 * Consumes the unified response from useChartData.
 */
const TelemetryChart = ({ chartResponse }) => {
  // Destructure with safety defaults matching useChartData's return shape
  const { 
    data = [], 
    hasData = false, 
    ui: uiConfig = {} // Automatically pull the config returned by the hook
  } = chartResponse || {};

  // --- 1. Empty State Guard ---
  if (!hasData || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400 italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 animate-pulse">
        No telemetry data available for this period.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }} className="transition-opacity duration-300">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={uiConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={uiConfig.chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={uiConfig.chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray={CHART_STYLES.grid.strokeDasharray} 
            vertical={CHART_STYLES.grid.vertical} 
            stroke={CHART_STYLES.grid.stroke} 
          />

          <XAxis 
            dataKey="displayTime" 
            tick={CHART_STYLES.axis}
            stroke={CHART_STYLES.axis.stroke}
            tickMargin={CHART_STYLES.axis.tickMargin}
            minTickGap={40} // Increased for better readability on mobile
          />

          <YAxis 
            tick={CHART_STYLES.axis}
            stroke={CHART_STYLES.axis.stroke}
            tickMargin={CHART_STYLES.axis.tickMargin}
            domain={['auto', 'auto']} 
            allowDecimals={true}
          />

          <Tooltip 
            content={<CustomTooltip unit={uiConfig.unit} />}
            cursor={{ stroke: CHART_STYLES.grid.stroke, strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={uiConfig.chartColor}
            strokeWidth={CHART_STYLES.line.strokeWidth}
            fillOpacity={1}
            fill={`url(#${uiConfig.gradientId})`}
            // IMPORTANT: Set to false to respect the Gap Detection logic 
            // of processLogsInWindows
            connectNulls={false} 
            dot={CHART_STYLES.line.dotSize > 0}
            activeDot={{ 
              r: CHART_STYLES.line.activeDotSize, 
              strokeWidth: 0, 
              fill: uiConfig.chartColor 
            }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * CUSTOM TOOLTIP: Consumes unit and value safely
 */
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    
    return (
      <div 
        style={CHART_STYLES.tooltip.contentStyle} 
        className="p-3 border border-slate-100 shadow-xl rounded-lg bg-white/90 backdrop-blur-sm"
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-black">
          {label}
        </p>
        <p 
          className="text-sm font-black" 
          style={{ ...CHART_STYLES.tooltip.itemStyle, color: payload[0].color }}
        >
          {value !== null 
            ? `${Number(value).toFixed(1)} ${unit || ''}` 
            : 'Sensor Offline'}
        </p>
      </div>
    );
  }
  return null;
};

export default memo(TelemetryChart);