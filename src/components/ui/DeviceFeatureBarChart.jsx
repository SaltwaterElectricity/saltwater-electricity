import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * DeviceFeatureBarChart Component
 * Visualizes Voltage, Salinity, and Current across devices.
 * Matches AlonKuryente "Three Feature Data" section.
 */
const DeviceFeatureBarChart = memo(({ data = [] }) => {
  // Default fallback data matching mockup
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Device 1", voltage: 80, salinity: 60, current: 40 },
          { name: "Device 2", voltage: 65, salinity: 75, current: 45 },
          { name: "Device 3", voltage: 90, salinity: 55, current: 65 },
          { name: "Device 4", voltage: 60, salinity: 80, current: 55 },
        ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">
          DEVICES Feature Data
        </h3>
        <div className="flex gap-4 md:gap-6">
          <LegendItem color="#2563eb" label="Voltage" />
          <LegendItem color="#00A3C4" label="Salinity" />
          <LegendItem color="#c3c6d7" label="Current" />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f4f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737686", fontSize: 10, fontWeight: 700, textAnchor: "middle" }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737686", fontSize: 10, fontWeight: 700 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip cursor={{ fill: "#f8fafc" }} content={<CustomTooltip />} />
            <Bar dataKey="voltage" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={20} />
            <Bar dataKey="salinity" fill="#00A3C4" radius={[10, 10, 0, 0]} barSize={20} />
            <Bar dataKey="current" fill="#c3c6d7" radius={[10, 10, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-bold text-outline uppercase tracking-tight">{label}</span>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-2xl border border-outline-variant/20">
        <p className="text-[11px] font-black text-on-surface uppercase tracking-widest mb-2 border-b border-outline-variant/10 pb-1">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="text-[10px] font-black text-on-surface">{entry.value}</span>
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
