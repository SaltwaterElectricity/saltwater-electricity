import { memo, useMemo } from "react";
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
  // 1. Process logs for trend chart (Last 7 entries or aggregated by day)
  const chartData = useMemo(() => {
    return [...logs].reverse().slice(-15).map(log => ({
      name: new Date(log.__normalizedTs).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      voltage: log.voltage || 0,
      salinity: log.tds || 0,
      current: log.current || 0,
    }));
  }, [logs]);

  // 2. Summary stats for donut chart
  const distributionData = useMemo(() => {
    const totals = logs.reduce((acc, log) => {
      acc.voltage += log.voltage || 0;
      acc.salinity += log.tds || 0;
      acc.current += log.current || 0;
      return acc;
    }, { voltage: 0, salinity: 0, current: 0 });

    const totalAll = totals.voltage + totals.salinity + totals.current || 1;

    return [
      { name: "Voltage", value: totals.voltage, color: "#003594", percent: ((totals.voltage / totalAll) * 100).toFixed(1) },
      { name: "Salinity", value: totals.salinity, color: "#0891b2", percent: ((totals.salinity / totalAll) * 100).toFixed(1) },
      { name: "Current", value: totals.current, color: "#ea580c", percent: ((totals.current / totalAll) * 100).toFixed(1) },
    ];
  }, [logs]);

  const totalReadings = logs.length.toLocaleString();

  return (
    <section className="px-xl mt-lg grid grid-cols-1 lg:grid-cols-12 gap-lg">
      {/* 1. Electricity Generation Trends */}
      <div className="lg:col-span-8 bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[450px]">
        <div className="flex justify-between items-center mb-lg">
          <div>
            <h4 className="font-headline-md text-headline-md">
              <span className="text-on-surface">Historical</span> <span className="text-primary">Data Records</span>
            </h4>
            <p className="text-body-sm text-secondary">Voltage, salinity, and current readings over time.</p>
          </div>
          <select className="bg-surface-container-low border-none rounded-lg text-label-caps py-1.5 pl-3 pr-8 focus:ring-primary cursor-pointer font-bold">
            <option>DAILY</option>
            <option>WEEKLY</option>
            <option>MONTHLY</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-lg mb-md">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked 
              readOnly 
              className="rounded text-[#ea580c] focus:ring-[#ea580c] w-4 h-4 cursor-pointer" 
            />
            <span className="text-body-sm text-secondary group-hover:text-primary transition-colors">Current (A)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked 
              readOnly 
              className="rounded text-[#003594] focus:ring-[#003594] w-4 h-4 cursor-pointer" 
            />
            <span className="text-body-sm text-secondary group-hover:text-primary-fixed-dim transition-colors">Voltage (V)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked 
              readOnly 
              className="rounded text-[#0891b2] focus:ring-[#0891b2] w-4 h-4 cursor-pointer" 
            />
            <span className="text-body-sm text-secondary group-hover:text-severity-info transition-colors">Salinity (ppm)</span>
          </label>
        </div>

        {/* Chart Area */}
        <div className="flex-1 w-full min-h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest animate-pulse rounded-lg">
              <p className="text-outline text-body-sm">Loading historical trends...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c3c6d6" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#565e74', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar dataKey="voltage" fill="#003594" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="current" fill="#ea580c" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />
                <Line 
                  type="monotone" 
                  dataKey="salinity" 
                  stroke="#0891b2" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} 
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Summary & Usage Sidebar */}
      <div className="lg:col-span-4 space-y-lg">
        {/* Historical Distribution Donut */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-md border-primary h-full">
          <h4 className="font-headline-md text-headline-md mb-md">
            <span className="text-on-surface">Data</span> <span className="text-primary">Summary</span>
          </h4>
          
          <div className="flex items-center gap-md">
            {/* Donut Chart */}
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={45}
                    outerRadius={54}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] text-outline uppercase tracking-tighter leading-none">Total</p>
                <p className="text-[14px] font-extrabold text-primary">{totalReadings}</p>
              </div>
            </div>

            {/* Legend with Percents */}
            <div className="flex-1 space-y-sm">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-none" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-label-xs font-bold">
                      <span>{item.name}</span>
                      <span>{item.percent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component Usage Section */}
          <div className="mt-lg pt-lg border-t border-outline-variant/30">
            <h5 className="text-label-caps text-secondary uppercase tracking-wider mb-md">Component Power Draw</h5>
            <div className="space-y-md">
              <UsageBar icon="developer_board" label="ESP32 Controller" value="24 W" percent={76} color="#9333ea" />
              <UsageBar icon="bolt" label="Voltage Sensor" value="8 W" percent={26} color="#ec4899" />
              <UsageBar icon="water_drop" label="Salinity Sensor" value="12 W" percent={42} color="#0ea5e9" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const UsageBar = ({ icon, label, value, percent, color }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
        <span className="text-body-sm font-bold text-on-surface">{label}</span>
      </div>
      <span className="font-bold text-secondary text-label-xs">{value}</span>
    </div>
    <div className="relative w-full bg-surface-container-low rounded-sm overflow-hidden flex items-center h-4">
      <div 
        className="h-full flex items-center justify-end pr-8 relative" 
        style={{ 
          width: `${percent}%`, 
          backgroundColor: color,
          clipPath: 'polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)' 
        }}
      >
        <span className="text-white font-bold absolute right-4 text-label-xs">{percent}%</span>
      </div>
    </div>
  </div>
);

export default memo(HistoricalCharts);
