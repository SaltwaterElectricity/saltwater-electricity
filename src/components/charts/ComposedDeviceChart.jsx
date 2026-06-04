import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e2e7" />
          <XAxis
            dataKey="timeLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#757689", fontWeight: 600 }}
            dy={10}
          />
          {/* Hide internal YAxis to use custom labels */}
          <YAxis hide domain={[0, 100]} />

          <Tooltip
            contentStyle={{
              backgroundColor: "#181c20",
              borderRadius: "8px",
              border: "none",
              color: "#fff",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff" }}
            cursor={{ fill: "rgba(0, 31, 255, 0.05)" }}
          />

          {/* Voltage: Primary Gradient Bars */}
          <Bar
            dataKey="voltageNormalized"
            fill="#0A2EFF"
            radius={[4, 4, 0, 0]}
            barSize={10}
            animationDuration={1500}
          />

          {/* Current: Solid Blue Line */}
          <Line
            type="monotone"
            dataKey="currentNormalized"
            stroke="#2640ff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#2640ff", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1500}
          />

          {/* Salinity: Dashed Teal Line */}
          <Line
            type="monotone"
            dataKey="salinityNormalized"
            stroke="#1fd6c1"
            strokeWidth={2}
            strokeDasharray="4 4"
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
