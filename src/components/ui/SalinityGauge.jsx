import { useReadings } from "../../hooks";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * SalinityGauge Component
 * A responsive, SVG-based circular gauge with Glassmorphism styling.
 * Centered on 8pt grid typography and real-time telemetry updates.
 */
const SalinityGauge = ({ deviceId, size = 220 }) => {
  const { reading, loading, error } = useReadings(deviceId);

  // Data extraction: Prioritize 'salinity' but fallback to 'tds' as per hardware mapping
  const value = reading?.salinity ?? reading?.tds ?? 0;

  // Configuration from central constants
  const config = SENSOR_CONFIG[METRICS.TDS] || { min: 0, max: 100 };
  const min = config.min;
  const max = config.max;
  const unit = "ppt"; // Requested unit

  // SVG Calculation Logic
  const strokeWidth = 14;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div
        className="relative flex items-center justify-center bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl animate-pulse"
        style={{ width: "100%", maxWidth: size, aspectRatio: "1/1" }}
      >
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ⚠️ ERROR STATE
  if (error) {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-red-500/5 backdrop-blur-md rounded-[2.5rem] border border-red-500/20 shadow-xl p-6 text-center"
        style={{ width: "100%", maxWidth: size, aspectRatio: "1/1" }}
      >
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 font-black">!</span>
        </div>
        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
          Stream Error
        </p>
        <p className="text-[10px] text-slate-400 font-bold leading-tight">Check Connection</p>
      </div>
    );
  }

  return (
    <div
      className="group relative flex flex-col items-center justify-center bg-white/30 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-2xl transition-all duration-500 hover:bg-white/40 hover:scale-[1.02]"
      style={{ width: "100%", maxWidth: size, aspectRatio: "1/1" }}
    >
      {/* AMBIENT GLOW */}
      <div className="absolute inset-0 rounded-[3rem] bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* SVG GAUGE LAYER */}
      <svg
        className="transform -rotate-90 relative z-10 w-full h-full p-4"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          className="stroke-slate-200/30"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Active Arc */}
        <circle
          className="transition-all duration-1000 ease-out"
          stroke="url(#gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset,
            filter: "url(#gauge-glow)",
          }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* CENTER TYPOGRAPHY (8pt Grid Spacing) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
          Salinity
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter text-slate-900">
            {value.toFixed(value < 10 ? 1 : 0)}
          </span>
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{unit}</span>
        </div>
      </div>

      {/* LIVE HEARTBEAT INDICATOR */}
      <div className="absolute bottom-8 flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm border border-white/40 rounded-full shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
        </span>
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
          Live Stream
        </span>
      </div>
    </div>
  );
};

export default SalinityGauge;
