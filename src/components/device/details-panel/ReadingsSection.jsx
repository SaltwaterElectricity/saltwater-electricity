import { useMemo, useState, useEffect } from "react";
import { Zap, Droplets, Clock, Loader2 } from "lucide-react";
import { useHistory } from "../../../hooks/useHistory";
import { useCountUp } from "../../../hooks/useCountUp";
import { cn } from "../../../utils/cn";

/**
 * ReadingsSection Component
 * High-level summary of latest telemetry metrics with visual history bars.
 * Refactored for high-fidelity Data Hydration animations.
 */
export const ReadingsSection = ({ deviceId, telemetry }) => {
  const { logs, loading } = useHistory(deviceId, 20);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const voltage = telemetry?.voltage || 0;
  const tds = telemetry?.tds || 0;
  
  // 1. HYDRATION: Count-up for primary readings
  const animatedVoltage = useCountUp(voltage, 1500, 1);
  const animatedTds = useCountUp(tds, 1500, 0);

  const timestamp = telemetry?.timestamp
    ? new Date(telemetry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  // Requirement: Transform historical logs into chart bars and summary stats
  const metrics = useMemo(() => {
    if (!logs || logs.length === 0) {
      return {
        voltageBars: Array(18).fill(0),
        tdsBars: Array(18).fill(0),
        peakVoltage: voltage,
        avgTds: tds,
      };
    }

    const sortedLogs = [...logs].reverse(); // Timeline: Left (Old) -> Right (New)

    // Normalize values to 0-100% based on typical ranges
    const voltageBars = sortedLogs.map((l) => Math.min(100, (Number(l.voltage) / 250) * 100));
    const tdsBars = sortedLogs.map((l) => Math.min(100, (Number(l.tds) / 500) * 100));

    const peakVoltage = Math.max(...logs.map((l) => Number(l.voltage)));
    const avgTds = Math.round(logs.reduce((acc, l) => acc + Number(l.tds), 0) / logs.length);

    return { voltageBars, tdsBars, peakVoltage, avgTds };
  }, [logs, voltage, tds]);

  return (
    <section id="section-readings" className="scroll-mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg font-bold text-primary">Real-Time Readings</h3>
        {loading && <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />}
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex gap-1 p-1 bg-slate-100/50 rounded-xl border border-slate-100">
          {["1HR", "3HR", "6HR", "24HR", "1D", "7D", "1M"].map((label) => (
            <button
              key={label}
              disabled
              className={cn(
                "px-3 py-1.5 text-[10px] font-black tracking-widest transition-all rounded-lg opacity-50 cursor-not-allowed uppercase",
                label === "1D" ? "bg-white shadow-sm text-primary opacity-100" : "text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {/* Voltage Card */}
        <ReadingGraphCard
          icon={Zap}
          label="Voltage Potential"
          value={animatedVoltage}
          unit="V"
          subValue={`${timestamp} | ${metrics.peakVoltage}V Peak`}
          color="primary"
          bars={metrics.voltageBars}
          telemetry={telemetry}
          isMounted={isMounted}
        />

        {/* Salinity Card */}
        <ReadingGraphCard
          icon={Droplets}
          label="Ionic Density Spectrum"
          value={animatedTds}
          unit="PPM"
          subValue={`${timestamp} | ${metrics.avgTds}ppm Avg`}
          color="tertiary"
          bars={metrics.tdsBars}
          telemetry={telemetry}
          isMounted={isMounted}
        />
      </div>
    </section>
  );
};

const ReadingGraphCard = ({ icon: Icon, label, value, unit, subValue, color, bars, telemetry, isMounted }) => (
  <div
    className={cn(
      "bg-white border rounded-[32px] p-8 hover:shadow-xl transition-all duration-500 border-slate-100 group overflow-hidden border-b-2",
      color === "primary" ? "hover:border-primary border-b-primary/20" : "hover:border-orange-500 border-b-orange-500/20"
    )}
  >
    <div className="flex justify-between items-start mb-8">
      <div>
        <p className="font-display text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
          <span className={cn("text-sm font-black uppercase tracking-widest", color === "primary" ? "text-primary" : "text-orange-500")}>{unit}</span>
        </div>
        <p className="text-[11px] text-slate-400 font-bold mt-3 flex items-center gap-1.5 uppercase tracking-tight">
          <Clock size={12} className="text-slate-300" /> {subValue}
        </p>
      </div>
      <div
        className={cn(
          "w-12 h-12 rounded-2xl transition-all duration-500 flex items-center justify-center border shadow-sm group-hover:scale-110",
          color === "primary"
            ? "bg-blue-50 text-primary border-blue-100"
            : "bg-orange-50 text-orange-600 border-orange-100"
        )}
      >
        <Icon size={24} />
      </div>
    </div>

    <div className="flex gap-6">
      {/* Y-Axis Simulation */}
      <div className="flex flex-col justify-between text-[9px] text-slate-300 font-black h-28 py-1 uppercase tracking-tighter">
        <span>{color === "primary" ? "250V" : "500"}</span>
        <span>{color === "primary" ? "125V" : "250"}</span>
        <span>0</span>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative h-28 pt-2 border-l border-slate-50">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 pt-2">
          <div className="border-t border-slate-50/50 w-full" />
          <div className="border-t border-slate-50/50 w-full" />
          <div className="border-t border-slate-50/50 w-full" />
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1.5 h-full relative z-10 overflow-hidden px-1">
          {bars.length > 0 ? (
            bars.map((h, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`bar-${color}-${telemetry?.timestamp || "default"}-${i}`}
                className={cn(
                  "flex-1 rounded-t-lg transition-all duration-1500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                  color === "primary"
                    ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                    : "bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                )}
                style={{
                  height: isMounted ? `${Math.max(4, h)}%` : "2%", 
                  transitionDelay: `${i * 30}ms`,
                  opacity: 0.2 + (i / bars.length) * 0.8,
                }}
              />
            ))
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-[10px] text-slate-200 uppercase font-black tracking-widest">
                Waiting for Sync
              </span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* X-Axis */}
    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 border-t border-slate-50 pt-3 ml-12 uppercase tracking-widest">
      <span>Historical Window</span>
      <span className="text-primary animate-pulse">Real-time Live</span>
    </div>
  </div>
);
