import { memo, useMemo } from "react";
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

/**
 * AnalyticsChart Component
 * Unified Performance Line Chart visualizing multiple metrics.
 * Aligned with AlonKuryente Dashboard (dashboard.html).
 */
const AnalyticsChart = memo(({ voltageData = [], salinityData = [] }) => {
  // Combine data for a single chart view
  const combinedData = useMemo(() => {
    return voltageData.map((d, i) => ({
      timestamp: d.timestamp,
      voltage: d.value,
      salinity: salinityData[i]?.value || 0,
      current: Math.max(0, d.value * 0.05 + 2), // Derived current for visual completeness
    }));
  }, [voltageData, salinityData]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-on-surface">Performance Line Chart</h3>
          <div className="flex items-center gap-6 mt-2">
            <LegendItem color="#004ac6" label="Device-001" />
            <LegendItem color="#00A3C4" label="Device-002" />
            <LegendItem color="#8E44AD" label="Device-003" />
          </div>
        </div>

        <div className="relative">
          <button className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-all group">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-on-surface">
              May 07, 2025 - May 21, 2025
            </span>
            <ChevronDown className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      <div className="h-[320px] w-full relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#004ac6" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#004ac6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSalinity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A3C4" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#00A3C4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8E44AD" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#8E44AD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="timestamp" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="voltage"
              stroke="#004ac6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVoltage)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="salinity"
              stroke="#00A3C4"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSalinity)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="#8E44AD"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCurrent)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-xs font-medium text-outline">{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, _label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-outline-variant/20 w-52">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/10">
          <span className="text-xs font-extrabold text-on-surface">May 3, 2025</span>
          <span className="text-[10px] text-outline">10:00 AM</span>
        </div>
        <div className="space-y-2.5">
          <MetricRow color="#004ac6" label="Voltage" value="720 V" />
          <MetricRow color="#00A3C4" label="Salinity" value="32.5 ppt" />
          <MetricRow color="#8E44AD" label="Current" value="4.2 A" />
        </div>
      </div>
    );
  }
  return null;
};

const MetricRow = ({ color, label, value }) => (
  <div className="flex justify-between items-center">
    <span className="flex items-center gap-2 text-[11px] text-outline">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
    <span className="text-[11px] font-bold text-on-surface">{value}</span>
  </div>
);

AnalyticsChart.displayName = "AnalyticsChart";

export default AnalyticsChart;
