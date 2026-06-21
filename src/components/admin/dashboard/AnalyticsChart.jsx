import { memo, useState, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../../utils/cn";

/**
 * AnalyticsChart Component
 *
 * Pixel-perfect React implementation of the 'Performance Line Chart'
 * from the AlonKuryente Dashboard (dashboard.html).
 *
 * MIRROR SPECS:
 * - Smooth (monotone) Area Chart
 * - Multi-device comparative telemetry (TDS/Salinity)
 * - Radial gradient background pattern
 * - Legacy-styled legend and custom Calendar UI
 */
const AnalyticsChart = memo(
  ({ data = [], devices = [], selectedDate, setSelectedDate, loading }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    // 1. DATE FORMATTING LOGIC
    const displayDateLabel = useMemo(() => {
      if (!selectedDate) return "Recent Audit Stream";
      const [y, m, d] = selectedDate.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return "Recent Audit Stream";

      return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }, [selectedDate]);

    // 2. CALENDAR GENERATION LOGIC
    const calendarDays = useMemo(() => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();

      const days = [];
      // Padding from previous month
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, currentMonth: false, id: `prev-${i}` });
      }
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, currentMonth: true, id: `curr-${i}` });
      }
      return days;
    }, [viewDate]);

    const changeMonth = (offset) => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const handleDateSelect = (dayObj) => {
      if (!dayObj.currentMonth) return;
      const y = viewDate.getFullYear();
      const m = String(viewDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayObj.day).padStart(2, "0");
      setSelectedDate(`${y}-${m}-${d}`);
      setShowCalendar(false);
    };

    return (
      <div className="bg-white p-8 rounded-xl shadow-sm h-full min-h-[520px] lg:min-h-[650px] flex flex-col relative border border-outline-variant/10 transition-all hover:shadow-md">
        {/* --- 1. MIRRORED HEADER SECTION --- */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-on-surface">Performance Line Chart</h3>
            <div className="flex items-center gap-6 mt-2">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <div key={device.id} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: device.color }}
                    />
                    <span className="text-xs font-medium text-outline">
                      {device.name || `Device-${device.id.substring(0, 3)}`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-outline italic">No comparative devices selected</p>
              )}
            </div>
          </div>

          {/* --- MIRRORED DATE PICKER TRIGGER --- */}
          <div className="relative inline-block">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-3 px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-all group"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-on-surface">{displayDateLabel}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-outline group-hover:text-primary transition-all",
                  showCalendar && "rotate-180"
                )}
              />
            </button>

            {/* --- MIRRORED CALENDAR POPOVER --- */}
            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-outline-variant/20 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-1 hover:bg-surface-container rounded-lg transition-colors"
                    >
                      <ChevronLeft size={16} className="text-outline" />
                    </button>
                    <span className="text-sm font-bold text-on-surface uppercase tracking-tight">
                      {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-1 hover:bg-surface-container rounded-lg transition-colors"
                    >
                      <ChevronRight size={16} className="text-outline" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-outline uppercase mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d) => {
                      const isSelected =
                        selectedDate ===
                          `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` &&
                        d.currentMonth;

                      return (
                        <div
                          key={d.id}
                          onClick={() => handleDateSelect(d)}
                          className={cn(
                            "p-2 text-[11px] text-center cursor-pointer transition-all rounded-lg font-bold",
                            !d.currentMonth && "text-outline/30 cursor-default",
                            d.currentMonth &&
                              !isSelected &&
                              "hover:bg-surface-container text-on-surface",
                            isSelected && "bg-primary text-white shadow-lg shadow-primary/20"
                          )}
                        >
                          {d.day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setShowCalendar(false);
                    }}
                    className="px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    Reset to Recent
                  </button>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="px-3 py-1.5 text-[11px] font-bold bg-primary text-white rounded-lg shadow-sm hover:brightness-110 transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 2. CHART AREA WITH RADIAL PATTERN --- */}
        <div className="relative h-[420px] lg:h-[550px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] group/chart flex-1">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                  Auditing Historical Nodes...
                </p>
              </div>
            </div>
          ) : devices.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Calendar className="text-outline w-12 h-12 mb-4" />
              <h4 className="text-xs font-black uppercase tracking-widest text-on-surface">
                No Units for Audit
              </h4>
              <p className="text-[10px] text-outline mt-2 max-w-[220px]">
                Provision hardware units to begin comparative performance auditing.
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Calendar className="text-slate-300 w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                No Data Records Found
              </h4>
              <p className="text-[10px] text-slate-300 mt-2 max-w-[200px]">
                {selectedDate
                  ? "No telemetry packets were recorded for the selected date."
                  : "No historical telemetry available for the active nodes."}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {devices.map((device) => (
                    <linearGradient
                      key={`grad-${device.id}`}
                      id={`color-${device.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={device.color} stopOpacity={0.1} />
                      <stop offset="95%" stopColor={device.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  tickFormatter={(ts) =>
                    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  }
                  axisLine={false}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={[0, (dataMax) => (dataMax < 100 ? 100 : "auto")]}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip devices={devices} />}
                  cursor={{ stroke: "#2563eb", strokeWidth: 1, strokeDasharray: "4 4" }}
                />

                {devices.map((device) => (
                  <Area
                    key={device.id}
                    type="monotone"
                    dataKey={(entry) => entry[`${device.id}_tds`]}
                    name={device.name}
                    stroke={device.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#color-${device.id})`}
                    animationDuration={1500}
                    isAnimationActive={false}
                    connectNulls
                    dot={{ r: 0, fill: "white", stroke: device.color, strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mirrored Spacer Section */}
        <div className="mt-8 px-2" />
      </div>
    );
  }
);

/**
 * CustomTooltip
 * Mirror of 'chart-tooltip' ID from dashboard.html.
 */
const CustomTooltip = ({ active, payload, label, devices }) => {
  if (active && payload && payload.length) {
    const d = new Date(label);
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Payload[0].payload contains the merged object for this timestamp
    const dataPoint = payload[0]?.payload || {};

    return (
      <div className="bg-white p-3 rounded-xl shadow-2xl border border-outline-variant/20 min-w-[210px] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-outline-variant/10">
          <span className="text-xs font-black text-on-surface">{dateStr}</span>
          <span className="text-[9px] text-outline font-bold">{timeStr}</span>
        </div>

        <div className="space-y-1.5">
          {devices.map((device) => {
            const deviceData = dataPoint[`${device.id}_full`];
            const tdsValue = dataPoint[`${device.id}_tds`];

            if (tdsValue === undefined && !deviceData) return null;

            return (
              <div key={device.id} className="space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[10px] text-outline font-bold uppercase tracking-tight">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: device.color }}
                    />
                    {device.name || device.id.substring(0, 8)}
                  </span>
                  <span className="text-[10px] font-black text-on-surface">
                    {Math.round(tdsValue || 0)}{" "}
                    <span className="text-[8px] text-outline-variant">ppm</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 pt-1.5 border-t border-outline-variant/10 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-teal-600 text-[12px] fill">
            check_circle
          </span>
          <span className="text-[9px] font-black text-teal-600 uppercase tracking-tighter">
            Status: Optimal
          </span>
        </div>
      </div>
    );
  }
  return null;
};

AnalyticsChart.displayName = "AnalyticsChart";

export default AnalyticsChart;
