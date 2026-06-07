import { useMemo } from "react";
import { Zap, Droplets, Clock, Loader2 } from "lucide-react";
import { useHistory } from "../../../hooks/useHistory";
import { cn } from "../../../utils/cn";

/**
 * ReadingsSection Component
 * High-level summary of latest telemetry metrics with visual history bars.
 * Connected to actual device history.
 */
export const ReadingsSection = ({ deviceId, telemetry }) => {
  const { logs, loading } = useHistory(deviceId, 20);

  const voltage = telemetry?.voltage || 0;
  const tds = telemetry?.tds || 0;
  const timestamp = telemetry?.timestamp 
    ? new Date(telemetry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "--:--";

  // Requirement: Transform historical logs into chart bars and summary stats
  const metrics = useMemo(() => {
    if (!logs || logs.length === 0) {
      return { 
        voltageBars: Array(18).fill(0), 
        tdsBars: Array(18).fill(0), 
        peakVoltage: voltage, 
        avgTds: tds 
      };
    }

    const sortedLogs = [...logs].reverse(); // Timeline: Left (Old) -> Right (New)
    
    // Normalize values to 0-100% based on typical ranges
    const voltageBars = sortedLogs.map(l => Math.min(100, (Number(l.voltage) / 250) * 100));
    const tdsBars = sortedLogs.map(l => Math.min(100, (Number(l.tds) / 500) * 100));
    
    const peakVoltage = Math.max(...logs.map(l => Number(l.voltage)));
    const avgTds = Math.round(logs.reduce((acc, l) => acc + Number(l.tds), 0) / logs.length);

    return { voltageBars, tdsBars, peakVoltage, avgTds };
  }, [logs, voltage, tds]);

  return (
    <section id="section-readings" className="scroll-mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display text-lg font-bold text-primary">Real-Time Readings</h3>
        {loading && <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />}
      </div>

      <div className="flex justify-center mb-6">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {["1HR", "3HR", "6HR", "24HR", "1D", "7D", "1M"].map((label) => (
            <button
              key={label}
              disabled
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold transition-all rounded-md opacity-50 cursor-not-allowed",
                label === "1D" ? "bg-white shadow-sm text-primary opacity-100" : "text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Voltage Card */}
        <ReadingGraphCard
          icon={Zap}
          label="Voltage (V)"
          value={`${voltage}V`}
          subValue={`${timestamp} | ${metrics.peakVoltage}V Peak`}
          color="primary"
          bars={metrics.voltageBars}
          telemetry={telemetry}
        />

        {/* Salinity Card */}
        <ReadingGraphCard
          icon={Droplets}
          label="Salinity (ppm)"
          value={`${tds}ppm`}
          subValue={`${timestamp} | ${metrics.avgTds}ppm Avg`}
          color="tertiary"
          bars={metrics.tdsBars}
          telemetry={telemetry}
        />
      </div>
    </section>
  );
};

const ReadingGraphCard = ({ icon: Icon, label, value, subValue, color, bars, telemetry }) => (
  <div className={cn(
    "bg-white border rounded-[24px] p-6 hover:shadow-md transition-all border-slate-100 group overflow-hidden",
    color === "primary" ? "hover:border-primary/50" : "hover:border-orange-500/50"
  )}>
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="font-display text-[12px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-bold text-slate-900">{value}</span>
        </div>
        <p className="text-[12px] text-slate-400 font-mono mt-2 flex items-center gap-1">
          <Clock size={12} /> {subValue}
        </p>
      </div>
      <div className={cn(
        "p-3 rounded-xl transition-colors border",
        color === "primary" ? "bg-blue-50 text-primary border-blue-100" : "bg-orange-50 text-orange-600 border-orange-100"
      )}>
        <Icon size={24} />
      </div>
    </div>

    <div className="flex gap-4">
      {/* Y-Axis Simulation */}
      <div className="flex flex-col justify-between text-[10px] text-slate-300 font-mono h-24 py-1">
        <span>{color === "primary" ? "250V" : "500"}</span>
        <span>{color === "primary" ? "125V" : "250"}</span>
        <span>0</span>
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 relative h-24 pt-2 border-l border-slate-50">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 pt-2">
          <div className="border-t border-slate-50 w-full" />
          <div className="border-t border-slate-50 w-full" />
          <div className="border-t border-slate-50 w-full" />
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1.5 h-full relative z-10 overflow-hidden">
          {bars.length > 0 ? (
            bars.map((h, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`bar-${color}-${telemetry?.timestamp || 'default'}-${i}`}
                className={cn(
                  "flex-1 rounded-t-sm transition-all duration-1000",
                  color === "primary" 
                    ? "bg-gradient-to-t from-blue-600 to-blue-400" 
                    : "bg-gradient-to-t from-orange-600 to-orange-400"
                )}
                style={{ 
                  height: `${Math.max(2, h)}%`, // Ensure even small values are visible
                  opacity: 0.2 + (i / bars.length) * 0.8
                }}
              />
            ))
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-[10px] text-slate-200 uppercase font-bold tracking-widest">No History</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* X-Axis */}
    <div className="flex justify-between mt-3 text-[9px] font-mono text-slate-300 border-t border-slate-50 pt-2 ml-8">
      <span>History (Recent)</span>
      <span>Now</span>
    </div>
  </div>
);
