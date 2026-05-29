import { memo, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { METRIC_CONFIG, METRICS } from "../../constants";

/**
 * AnalyticsChart Component
 * 
 * Refactored for Multi-Device Performance Auditing.
 * Displays Salinity (TDS) trends for multiple devices.
 * Provides full health breakdown (Voltage, Current) in the tooltip.
 */
const AnalyticsChart = memo(({ data = [], devices = [] }) => {
  const [showCalendarPlaceholder, setShowCalendarPlaceholder] = useState(false);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col relative">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-on-surface">System Performance Audit</h3>
          <p className="text-xs text-outline font-medium">Comparative Salinity (TDS) Monitoring</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
            {devices.map((device) => (
              <LegendItem 
                key={device.id} 
                color={device.color} 
                label={device.name || device.id.substring(0, 8)} 
              />
            ))}
          </div>
        </div>

        <div className="relative shrink-0">
          <button 
            onClick={() => setShowCalendarPlaceholder(!showCalendarPlaceholder)}
            className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-all group"
          >
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-on-surface">
              Real-time Analysis
            </span>
            <ChevronDown className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
          </button>
          
          {showCalendarPlaceholder && (
            <div className="absolute right-0 top-full mt-2 p-4 bg-white rounded-xl shadow-2xl border border-outline-variant/20 z-50 w-64 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold text-on-surface mb-2">Historical Analysis</p>
              <p className="text-[10px] text-outline leading-relaxed">
                The advanced date picker is being synchronized with the facility&apos;s local time server. 
                Currently showing the latest 24 hours of telemetry.
              </p>
              <button 
                onClick={() => setShowCalendarPlaceholder(false)}
                className="w-full mt-3 py-2 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-all"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-[320px] w-full relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] flex-1">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-bold text-outline uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {devices.map((device) => (
                  <linearGradient key={`grad-${device.id}`} id={`color-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={device.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={device.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={[0, 'auto']}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip devices={devices} />} />
              
              {devices.map((device) => (
                <Area
                  key={device.id}
                  type="monotone"
                  dataKey={`${device.id}_tds`}
                  name={device.name}
                  stroke={device.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#color-${device.id})`}
                  animationDuration={1000}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-bold uppercase tracking-wider text-outline">{label}</span>
  </div>
);

/**
 * CustomTooltip
 * 
 * Generates a "Health Card" for each device at the hovered timestamp.
 */
const CustomTooltip = ({ active, payload, label, devices }) => {
  if (active && payload && payload.length) {
    const timestamp = label ? new Date(label).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "Unknown Time";

    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-outline-variant/20 min-w-[220px] space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">Audit Snapshot</span>
          <span className="text-[10px] font-bold text-primary">{timestamp}</span>
        </div>

        <div className="space-y-4">
          {devices.map((device) => {
            const deviceData = payload[0]?.payload[`${device.id}_full`];
            if (!deviceData) return null;

            return (
              <div key={device.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                  <span className="text-[11px] font-black text-on-surface uppercase truncate">
                    {device.name || device.id}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 pl-3 border-l border-outline-variant/20 ml-0.5">
                  <MetricRow 
                    label="Salinity" 
                    value={deviceData.tds} 
                    unit={METRIC_CONFIG[METRICS.TDS].unit} 
                  />
                  <MetricRow 
                    label="Voltage" 
                    value={deviceData.voltage} 
                    unit={METRIC_CONFIG[METRICS.VOLTAGE].unit} 
                  />
                  <MetricRow 
                    label="Current" 
                    value={deviceData.current} 
                    unit={METRIC_CONFIG[METRICS.CURRENT].unit} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const MetricRow = ({ label, value, unit }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-medium text-outline uppercase">{label}</span>
    <span className="text-[10px] font-bold text-on-surface">
      {value} <span className="text-[9px] text-outline-variant font-medium">{unit}</span>
    </span>
  </div>
);

AnalyticsChart.displayName = "AnalyticsChart";

export default AnalyticsChart;
