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
        <div className="relative">
          <Activity className="w-10 h-10 text-primary animate-pulse opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full animate-ping opacity-40" />
          </div>
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-6">
          Synchronizing Device Features...
        </p>
      </div>
    );
  }

  const chartData = data;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col border border-outline-variant/10 transition-all hover:shadow-md">
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

      <div className="h-56 w-full flex-1">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Activity className="text-outline w-8 h-8 mb-4" />
            <p className="text-xs font-bold text-outline uppercase tracking-widest">
              No Data Records Found
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc", opacity: 0.5 }}
                content={<CustomTooltip />}
                animationDuration={300}
              />
              <Bar
                dataKey="voltage"
                fill="#004ac6"
                radius={[6, 6, 0, 0]}
                barSize={18}
                isAnimationActive={true}
                animationDuration={1500}
                className="transition-all duration-300 hover:brightness-110"
              />
              <Bar
                dataKey="salinity"
                fill="#00A3C4"
                radius={[6, 6, 0, 0]}
                barSize={18}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={200}
                className="transition-all duration-300 hover:brightness-110"
              />
              <Bar
                dataKey="current"
                fill="#c3c6d7"
                radius={[6, 6, 0, 0]}
                barSize={18}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={400}
                className="transition-all duration-300 hover:brightness-110"
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
    <span className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-black text-outline uppercase tracking-wider">{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 rounded-lg shadow-2xl border border-outline-variant/20 min-w-[130px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-on-surface uppercase tracking-tighter mb-1.5 border-b border-outline-variant/10 pb-1">
          {label}
        </p>
        <div className="space-y-0.5">
          {payload.map((entry) => (
            <div key={entry.name} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-outline uppercase">
                <span
                  className="w-1.5 h-1.5 rounded-full shadow-inner"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="text-[10px] font-black text-on-surface">
                {Math.round(entry.value)}%
              </span>
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
