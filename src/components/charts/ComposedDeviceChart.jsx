import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/**
 * Custom Tooltip component for high-fidelity technical oversight
 */
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Extract raw values calculated in ResidentDashboard
    const data = payload[0].payload;
    return (
      <div className="bg-[#181c20] text-white p-4 rounded-xl shadow-xl border border-slate-800 font-sans text-[12px] space-y-1.5 min-w-[150px]">
        <p className="font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1 font-bold">
          {data.dateLabel} • {label}
        </p>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400 font-medium">Voltage:</span>
          <span className="font-bold text-blue-400 font-mono">{data.voltage} V</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400 font-medium">Current:</span>
          <span className="font-bold text-[#2640ff] font-mono">{data.current} A</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400 font-medium">Salinity:</span>
          <span className="font-bold text-[#1fd6c1] font-mono">{data.salinity} ppt</span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * ComposedDeviceChart
 * High-fidelity device performance visualization mirrored from legacy design.
 * Visualizes Voltage (Bars), Current (Solid Line), and Salinity (Dashed Line).
 */
const ComposedDeviceChart = ({ data = [] }) => {
  return (
    <div className="w-full h-full min-h-[300px] font-['Inter'] relative">
      {/* Custom Y-Axis Labels matching legacy design */}
      <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[11px] text-on-surface-variant/70 font-semibold pr-4 w-8 text-right z-10 pointer-events-none">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 40, bottom: 20 }}
          barGap={2}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="chartPrimaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a2eff" stopOpacity={1} />
              <stop offset="100%" stopColor="#3d73ff" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#c5c5da" strokeOpacity={0.5} />
          
          {/* Solid base line mirrored from legacy border-t border-solid */}
          <ReferenceLine y={0} stroke="#c5c5da" strokeWidth={1.5} strokeOpacity={0.8} />

          <XAxis
            dataKey="timeLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#444557", fontWeight: 600, opacity: 0.7 }}
            dy={10}
            minTickGap={30}
          />
          {/* Hide internal YAxis to use custom labels */}
          <YAxis hide domain={[0, 100]} />

          <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(10, 46, 255, 0.03)" }} />

          {/* Voltage: Primary Gradient Bars with high rounding mirrored from legacy */}
          <Bar
            dataKey="voltageNormalized"
            fill="url(#chartPrimaryGradient)"
            radius={[20, 20, 0, 0]}
            barSize={10}
            animationDuration={1500}
          />

          {/* Current: Solid Blue Line - strokeWidth 1.5 to match legacy */}
          <Line
            type="monotone"
            dataKey="currentNormalized"
            stroke="#2640ff"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: "#2640ff", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1500}
          />

          {/* Salinity: Dashed Teal Line - dashPattern 2 2 and strokeWidth 1.5 to match legacy */}
          <Line
            type="monotone"
            dataKey="salinityNormalized"
            stroke="#1fd6c1"
            strokeWidth={1.5}
            strokeDasharray="2 2"
            dot={false}
            activeDot={{ r: 4, fill: "#1fd6c1", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComposedDeviceChart;
