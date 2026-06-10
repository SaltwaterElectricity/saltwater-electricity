import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

/**
 * Custom XAxis Tick to match legacy "sensors" icon and label style
 * Synchronized with dashboard.html's "Device Groups" labels.
 */
const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="middle"
        fill="#737686"
        fontSize={18}
        className="material-symbols-outlined"
        style={{ opacity: 0.4 }}
      >
        sensors
      </text>
      <text
        x={0}
        y={22}
        dy={10}
        textAnchor="middle"
        fill="#737686"
        fontSize={10}
        fontWeight={700}
        className="uppercase tracking-widest"
      >
        {payload.value}
      </text>
    </g>
  );
};

/**
 * DeviceFeatureBarChart Component
 * Visualizes Voltage, Salinity, and Current across devices.
 * Mirrors AlonKuryente "Three Feature Data" section from dashboard.html.
 * Uses real data normalization (0-100 scale) for visual comparison.
 */
const DeviceFeatureBarChart = memo(({ data = [], loading = false }) => {
  // If loading, show pulse state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-[400px] flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-primary/20 animate-pulse" />
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-4">
          Synchronizing Features...
        </p>
      </div>
    );
  }

  // Ensure we use real data if available, even if it's empty (show empty state instead of fake data)
  // However, we'll keep the fallback ONLY for initial mount/development as per original design intent.
  const chartData = data;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">
          DEVICES Feature Data
        </h3>
        <div className="flex gap-6">
          <LegendItem color="#004ac6" label="Voltage" />
          <LegendItem color="#00A3C4" label="Salinity" />
          <LegendItem color="#c3c6d7" label="Current" />
        </div>
      </div>

      <div className="h-64 w-full flex-1">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">
              No Data Available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={<CustomXAxisTick />}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#737686", fontSize: 10, fontWeight: 700 }}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc", opacity: 0.5 }}
                content={<CustomTooltip />}
                animationDuration={200}
              />
              <Bar
                dataKey="voltage"
                fill="#004ac6"
                radius={[10, 10, 0, 0]}
                barSize={20}
                className="transition-all duration-300 hover:filter-brightness-110"
              />
              <Bar
                dataKey="salinity"
                fill="#00A3C4"
                radius={[10, 10, 0, 0]}
                barSize={20}
                className="transition-all duration-300 hover:filter-brightness-110"
              />
              <Bar
                dataKey="current"
                fill="#c3c6d7"
                radius={[10, 10, 0, 0]}
                barSize={20}
                className="transition-all duration-300 hover:filter-brightness-110"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-bold text-outline uppercase tracking-tight">{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-2xl border border-outline-variant/20 min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[11px] font-black text-on-surface uppercase tracking-widest mb-3 border-b border-outline-variant/10 pb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry) => (
            <div key={entry.name} className="flex justify-between items-center gap-6">
              <span className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase">
                <span
                  className="w-2 h-2 rounded-full shadow-inner"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="text-[11px] font-black text-on-surface">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

DeviceFeatureBarChart.displayName = "DeviceFeatureBarChart";

export default DeviceFeatureBarChart;
