import { useMemo, useState, useEffect } from "react";
import { Cpu, Zap, Droplets, Settings, Lightbulb, Clock } from "lucide-react";
import { cn } from "../../../utils/cn";
import { useCountUp } from "../../../hooks/useCountUp";

/**
 * HardwareUsageSection Component
 * Visualizes current consumption across internal modules with sweep animations.
 */
export const HardwareUsageSection = ({ telemetry }) => {
  const currentTotal = telemetry?.current ? Math.round(telemetry.current * 1000) : 0; // Convert to mA
  const tsKey = telemetry?.timestamp ?? "standby";

  // 1. ANIMATION: Count-up for the big number
  const animatedTotal = useCountUp(currentTotal, 1500);

  // 2. ANIMATION: Local state for the "Fill" effect
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Requirement: Breakdown mapping using actual telemetry data
  const components = useMemo(() => {
    // Prioritize actual readings from the device
    const esp = telemetry?.esp_ma ?? 0;
    const bulb = telemetry?.bulb_ma ?? 0;
    const sensorTotal = telemetry?.sensor_ma ?? 0;

    // Split sensor_ma between voltage and salinity modules if not explicitly provided
    const vSensor = Math.round(sensorTotal * 0.4);
    const sSensor = Math.round(sensorTotal * 0.6);
    const relay = telemetry?.relay_active ? 15 : 0;

    return [
      {
        id: "esp",
        name: "ESP32 Controller",
        value: esp,
        icon: Cpu,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "volt",
        name: "Voltage Sensor",
        value: vSensor,
        icon: Zap,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "sal",
        name: "Salinity Sensor",
        value: sSensor,
        icon: Droplets,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "relay",
        name: "Relay Driver Module",
        value: relay,
        icon: Settings,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "bulb",
        name: "Smart Bulb",
        value: bulb,
        icon: Lightbulb,
        color: "from-blue-500 to-cyan-500",
      },
    ];
  }, [telemetry]);

  const timestamp = telemetry?.timestamp
    ? new Date(telemetry.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  return (
    <section id="section-components" className="scroll-mt-6">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-md font-bold text-primary">Hardware Component Usage</h3>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[6px] font-bold text-emerald-600 uppercase tracking-widest">
              Live Monitoring
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          Real-time current consumption of internal modules.
        </p>
      </div>

      {/* Circular Dial Gauge Card */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-8 mb-8 shadow-sm relative overflow-hidden flex flex-col items-center border-b-primary border-b-2">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* SVG for Segmented Ticks */}
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="tick-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="30%" stopColor="#a855f7" />
                <stop offset="70%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <g>
              {Array.from({ length: 60 }).map((_, i) => {
                const angle = ((i * 360) / 60) * (Math.PI / 180);
                const x1 = 50 + 42 * Math.cos(angle);
                const y1 = 50 + 42 * Math.sin(angle);
                const x2 = 50 + 46 * Math.cos(angle);
                const y2 = 50 + 46 * Math.sin(angle);

                // Sweep Animation: Only show tick if i is less than progress AND mounted
                const progressThreshold = (currentTotal / 300) * 60;
                const active = isMounted && i < Math.round(progressThreshold);

                return (
                  <line
                    // eslint-disable-next-line react/no-array-index-key
                    key={`tick-${tsKey}-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#tick-gradient)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity={active ? 1 : 0.1}
                    style={{ transition: `opacity 400ms ease-out ${i * 15}ms` }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Center Text */}
          <div className="text-center z-10 flex flex-col items-center">
            <span className="text-[64px] font-bold font-display leading-none text-slate-900 tracking-tighter">
              {animatedTotal}
            </span>
            <span className="text-[20px] font-bold text-slate-400 mt-1 uppercase">mA</span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-4 pt-2 border-t border-slate-50 w-24">
              Total Draw
            </span>
          </div>
        </div>

        {/* Status & Timestamp */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <div className="flex items-center gap-1.5 opacity-70">
            <Clock size={14} className="text-slate-400" />
            <span className="font-mono text-[12px] font-bold text-slate-500">{timestamp}</span>
          </div>
          <div className="px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Efficiency Nominal
            </span>
          </div>
        </div>
      </div>

      {/* Hardware Component Cards Vertical Stack */}
      <div className="space-y-3">
        {components.map((comp, idx) => (
          <div
            key={comp.id}
            className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-purple-500 group animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
              <comp.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="font-bold text-[14px] text-slate-700 truncate tracking-tight">
                  {comp.name}
                </h4>
                <span className="text-[9px] font-bold text-emerald-500 uppercase">Active</span>
              </div>
              <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1500 ease-out"
                  )}
                  style={{ width: isMounted ? `${Math.min(100, (comp.value / 200) * 100)}%` : "0%" }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-primary group-hover:text-purple-600 transition-colors text-[14px]">
                {comp.value} <span className="text-[10px] text-slate-300 font-normal">mA</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
