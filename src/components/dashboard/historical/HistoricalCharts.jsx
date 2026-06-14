import { memo, useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * HistoricalCharts Component
 * Mirrored from legacy design code1.html.
 * Features a large trend chart and a side panel with a distribution donut and power usage.
 */
const HistoricalCharts = ({ logs = [], loading = false }) => {
  // --- 1. Functional State: Visibility & Granularity ---
  const [granularity, setGranularity] = useState("DAILY");
  const [visible, setVisible] = useState({ v: true, s: true, c: true });

  const toggleVisibility = (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  // --- 2. Transformation: Grouping & Aggregation ---
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    // Sort oldest first for Recharts display
    const sorted = [...logs].sort((a, b) => a.__normalizedTs - b.__normalizedTs);

    if (granularity === "DAILY") {
      return sorted.slice(-15).map((log) => ({
        name: new Date(log.__normalizedTs).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        v: log.voltage || 0,
        s: log.tds || 0,
        c: log.current || 0,
        rawTs: log.__normalizedTs,
      }));
    }

    // Grouping Logic for WEEKLY/MONTHLY
    const groups = sorted.reduce((acc, log) => {
      const date = new Date(log.__normalizedTs);
      let key;

      if (granularity === "WEEKLY") {
        // Simple week calculation: Year + Week Number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(
          ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
        );
        key = `${date.getFullYear()}-W${weekNum}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      if (!acc[key]) acc[key] = { v: [], s: [], c: [], count: 0, ts: log.__normalizedTs };
      acc[key].v.push(log.voltage || 0);
      acc[key].s.push(log.tds || 0);
      acc[key].c.push(log.current || 0);
      acc[key].count++;
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([key, data]) => ({
        name:
          granularity === "WEEKLY"
            ? key
            : new Date(data.ts).toLocaleDateString([], { month: "short" }),
        v: Number((data.v.reduce((a, b) => a + b, 0) / data.count).toFixed(1)),
        s: Number((data.s.reduce((a, b) => a + b, 0) / data.count).toFixed(0)),
        c: Number((data.c.reduce((a, b) => a + b, 0) / data.count).toFixed(2)),
        rawTs: data.ts,
      }))
      .slice(-12);
  }, [logs, granularity]);

  // --- 3. Summary stats for donut chart (Actual Frequency counts) ---
  const distributionData = useMemo(() => {
    const counts = logs.reduce(
      (acc, log) => {
        if (log.voltage > 0) acc.voltage++;
        if ((log.tds || log.tds_ppm) > 0) acc.salinity++;
        if (log.current > 0) acc.current++;
        return acc;
      },
      { voltage: 0, salinity: 0, current: 0 }
    );

    const totalAll = counts.voltage + counts.salinity + counts.current || 1;

    return [
      {
        name: "Voltage",
        value: counts.voltage,
        color: "#003594",
        percent: ((counts.voltage / totalAll) * 100).toFixed(1),
      },
      {
        name: "Salinity",
        value: counts.salinity,
        color: "#0891b2",
        percent: ((counts.salinity / totalAll) * 100).toFixed(1),
      },
      {
        name: "Current",
        value: counts.current,
        color: "#ea580c",
        percent: ((counts.current / totalAll) * 100).toFixed(1),
      },
    ];
  }, [logs]);

  // --- 4. Dynamic Power Draw Calculation (Actual Hardware Telemetry) ---
  const powerStats = useMemo(() => {
    if (logs.length === 0)
      return {
        esp: { val: "0 A", pct: 0 },
        load: { val: "0 A", pct: 0 },
        sensors: { val: "0 A", pct: 0 },
      };

    const sums = logs.reduce(
      (acc, log) => {
        acc.esp += Number(log.esp_ma || 0);
        acc.load += Number(log.bulb_ma || 0);
        acc.sensors += Number(log.sensor_ma || 0);
        return acc;
      },
      { esp: 0, load: 0, sensors: 0 }
    );

    const avgEsp = sums.esp / logs.length;
    const avgLoad = sums.load / logs.length;
    const avgSensors = sums.sensors / logs.length;

    const totalMa = avgEsp + avgLoad + avgSensors || 1;

    return {
      esp: { val: (avgEsp / 1000).toFixed(2) + " A", pct: Math.round((avgEsp / totalMa) * 100) },
      load: { val: (avgLoad / 1000).toFixed(2) + " A", pct: Math.round((avgLoad / totalMa) * 100) },
      sensors: {
        val: (avgSensors / 1000).toFixed(2) + " A",
        pct: Math.round((avgSensors / totalMa) * 100),
      },
    };
  }, [logs]);

  const totalReadings = logs.length.toLocaleString();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Electricity Generation Trends */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-outline-variant shadow-sm flex flex-col min-h-[230px] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-lg font-black text-on-surface tracking-tight leading-none uppercase">
              <span className="text-on-surface">Historical</span>{" "}
              <span className="text-primary">Trends</span>
            </h4>
            <p className="text-[10px] text-secondary mt-1 font-bold uppercase tracking-wider">
              {granularity} Telemetry
            </p>
          </div>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl text-[9px] uppercase py-1 pl-2 pr-7 focus:ring-1 focus:ring-primary cursor-pointer font-black transition-all shadow-sm outline-none"
          >
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </select>
        </div>

        {/* Legend / Functional Toggles */}
        <div className="flex items-center gap-5 mb-2.5 border-b border-outline-variant/5 pb-2.5">
          <SeriesToggle
            label="Current"
            color="#ea580c"
            active={visible.c}
            onClick={() => toggleVisibility("c")}
          />
          <SeriesToggle
            label="Voltage"
            color="#003594"
            active={visible.v}
            onClick={() => toggleVisibility("v")}
          />
          <SeriesToggle
            label="Salinity"
            color="#0891b2"
            active={visible.s}
            onClick={() => toggleVisibility("s")}
          />
        </div>

        {/* Chart Area */}
        <div className="flex-1 w-full min-h-[90px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest animate-pulse rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline">
                Syncing...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                key={`${granularity}-${Object.values(visible).join("")}`}
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 0, left: -30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#c3c6d6"
                  opacity={0.15}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#565e74", fontSize: 8, fontWeight: 800 }}
                  dy={3}
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  cursor={{ stroke: "#f1f5f9", strokeWidth: 8 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    padding: "6px 8px",
                  }}
                  labelStyle={{
                    fontWeight: 900,
                    marginBottom: "1px",
                    color: "#1e293b",
                    fontSize: "10px",
                    textTransform: "uppercase",
                  }}
                />
                {visible.v && (
                  <Bar
                    dataKey="v"
                    fill="#003594"
                    opacity={0.25}
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  />
                )}
                {visible.c && (
                  <Bar
                    dataKey="c"
                    fill="#ea580c"
                    opacity={0.25}
                    radius={[2, 2, 0, 0]}
                    barSize={8}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  />
                )}
                {visible.s && (
                  <Line
                    type="monotone"
                    dataKey="s"
                    stroke="#0891b2"
                    strokeWidth={2}
                    dot={{ r: 1.5, fill: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 3.5, strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Summary & Usage Sidebar */}
      <div className="lg:col-span-4 space-y-3">
        <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-3.5 border-primary h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
          <h4 className="text-sm font-black text-on-surface tracking-tight mb-2.5 uppercase">
            <span className="text-on-surface">Data</span>{" "}
            <span className="text-primary">Summary</span>
          </h4>

          <div className="flex flex-col gap-2.5">
            <div className="relative w-full aspect-square max-w-[80px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius="70%"
                    outerRadius="95%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-primary tracking-tight leading-none">
                  {totalReadings}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0.5">
              {distributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface-container-low/20 border border-outline-variant/5"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-none"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-black text-on-surface leading-none uppercase tracking-tighter">
                      <span>{item.name}</span>
                      <span className="text-primary">{item.percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 pt-3.5 border-t border-outline-variant/10">
            <h5 className="text-[8px] text-secondary uppercase tracking-widest mb-2.5 font-black">
              Component Usage
            </h5>
            <div className="space-y-2.5">
              <UsageBar
                icon="developer_board"
                label="System (ESP32)"
                value={powerStats.esp.val}
                percent={powerStats.esp.pct}
                color="#9333ea"
              />
              <UsageBar
                icon="bolt"
                label="External Load"
                value={powerStats.load.val}
                percent={powerStats.load.pct}
                color="#ec4899"
              />
              <UsageBar
                icon="sensors"
                label="Sensor Array"
                value={powerStats.sensors.val}
                percent={powerStats.sensors.pct}
                color="#0ea5e9"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SeriesToggle = ({ label, color, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 cursor-pointer group transition-all ${active ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}
  >
    <div
      className="w-2 h-2 rounded-full border shadow-sm"
      style={{ backgroundColor: color, borderColor: color }}
    />
    <span className="text-[10px] font-extrabold text-secondary group-hover:text-primary transition-colors uppercase tracking-tight">
      {label}
    </span>
  </button>
);

const UsageBar = ({ icon, label, value, percent, color }) => (
  <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[15px]" style={{ color }}>
          {icon}
        </span>
        <span className="text-[10px] font-black text-on-surface uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="font-black text-secondary text-[9px]">{value}</span>
    </div>
    <div className="relative w-full bg-surface-container-low rounded-full overflow-hidden flex items-center h-2.5 border border-outline-variant/5 shadow-inner">
      <div
        className="h-full flex items-center justify-end pr-8 relative transition-all duration-1500 ease-out"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
          clipPath: "polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)",
        }}
      >
        <span className="text-white font-black absolute right-2 text-[7px] drop-shadow-sm">
          {percent}%
        </span>
      </div>
    </div>
  </div>
);

export default memo(HistoricalCharts);
