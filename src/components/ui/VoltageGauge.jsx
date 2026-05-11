import { useReadings } from "../../hooks";
import { cn } from "../../utils/cn";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * VoltageGauge Component
 * Semi-circle gauge for Node Power monitoring.
 * Features dynamic color zones and spring-action transitions.
 */
const VoltageGauge = ({ deviceId, size = 240 }) => {
  const { reading, loading, error } = useReadings(deviceId);

  const voltage = reading?.voltage ?? 0;
  const config = SENSOR_CONFIG[METRICS.VOLTAGE];
  const min = config.min;
  const max = config.max;

  // 🎨 DYNAMIC COLOR LOGIC
  const getStatusColor = (v) => {
    if (v < config.critical) return "stroke-red-600 shadow-red-600/50";
    if (v < config.warning) return "stroke-amber-500 shadow-amber-500/50";
    return "stroke-emerald-500 shadow-emerald-500/50";
  };

  const statusColor = getStatusColor(voltage);

  // 📐 SVG CALCULATIONS (Semi-circle)
  const strokeWidth = 16;
  const radius = size / 2 - strokeWidth;
  const circumference = Math.PI * radius; // Half circle
  const percentage = Math.min(Math.max(((voltage - min) / (max - min)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div
        className="relative flex items-center justify-center bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl animate-pulse"
        style={{ width: "100%", maxWidth: size, height: size / 1.5 }}
      >
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-end overflow-hidden p-6",
        "bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(3,7,18,0.5)]",
        "transition-all duration-500 hover:scale-[1.02]"
      )}
      style={{ width: "100%", maxWidth: size, height: size / 1.4 }}
    >
      {/* GAUGE CONTAINER */}
      <div className="relative w-full aspect-[2/1] flex items-center justify-center">
        <svg className="absolute top-0 w-full h-full transform" viewBox={`0 0 ${size} ${size / 2}`}>
          <defs>
            <filter id="voltage-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track (Semi-circle) */}
          <path
            d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
            fill="transparent"
            className="stroke-white/10"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress Path */}
          <path
            d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
            fill="transparent"
            className={cn(
              "transition-all duration-[1000ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              statusColor.split(" ")[0]
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: "url(#voltage-glow)" }}
          />
        </svg>

        {/* CENTER READING (8pt Spacing) */}
        <div className="flex flex-col items-center justify-center mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
            Voltage
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter text-white">
              {voltage.toFixed(2)}
            </span>
            <span className="text-sm font-black text-slate-500 uppercase">V</span>
          </div>
        </div>
      </div>

      {/* SCALE LABELS */}
      <div className="w-full flex justify-between mt-4 px-2">
        <span className="text-[8px] font-bold text-slate-500">0V</span>
        <span className="text-[8px] font-bold text-slate-500">15V</span>
      </div>

      {/* ERROR/OVERLAY MESSAGE */}
      {error && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 text-center z-50">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
            Connection Lost
          </p>
        </div>
      )}
    </div>
  );
};

export default VoltageGauge;
