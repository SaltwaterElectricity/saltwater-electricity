import { memo } from "react";
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
 * AnalyticsChart Component
 * Dynamic dual-matrix visualization for Energy (Voltage) and Salinity.
 * Adheres to AlonKuryente visual identity and 8-point grid rules.
 */
const AnalyticsChart = memo(({ voltageData = [], salinityData = [] }) => {
  return (
    <div className="glass-panel p-md bg-white/70 rounded-[20px] border border-white/40 shadow-sm transition-all">
      {/* Header & Legend */}
      <div className="flex justify-between items-center mb-md">
        <h3 className="font-h2 text-h2 text-primary font-['Space_Grotesk'] tracking-tight">
          Live Performance Matrix
        </h3>
        <div className="flex space-x-4 font-['Inter']">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#003d9b]" />
            <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest">
              ENERGY
            </span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#00c1fd]" />
            <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest">
              SALINITY
            </span>
          </span>
        </div>
      </div>

      {/* Dual Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md h-64 font-['Inter']">
        {/* ENERGY (VOLTAGE) CHART */}
        <div className="relative w-full h-full bg-slate-50/50 rounded-xl overflow-hidden p-4 border border-white/40 shadow-inner group">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#003d9b]/10 to-transparent pointer-events-none" />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={voltageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003d9b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#003d9b" stopOpacity={0} />
                </linearGradient>
                <filter id="glow-energy">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={CHART_STYLES.tooltip.contentStyle}
                itemStyle={{ fontSize: "10px", fontWeight: 900, color: "#003d9b" }}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#003d9b"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#energyGrad)"
                filter="url(#glow-energy)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
          <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pointer-events-none">
            ENERGY OUTPUT (MW)
          </span>
        </div>

        {/* SALINITY CHART */}
        <div className="relative w-full h-full bg-slate-50/50 rounded-xl overflow-hidden p-4 border border-white/40 shadow-inner group">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salinityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salinityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c1fd" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00c1fd" stopOpacity={0} />
                </linearGradient>
                <filter id="glow-salinity">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={CHART_STYLES.tooltip.contentStyle}
                itemStyle={{ fontSize: "10px", fontWeight: 900, color: "#00c1fd" }}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00c1fd"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salinityGrad)"
                filter="url(#glow-salinity)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
          <span className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pointer-events-none">
            SALINITY FLUCTUATION
          </span>
        </div>
      </div>
    </div>
  );
});

AnalyticsChart.displayName = "AnalyticsChart";

export default AnalyticsChart;
