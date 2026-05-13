import { useReadings } from "../../hooks";
import { cn } from "../../utils/cn";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * SalinityGauge Component
 * A circular, SVG-based gauge for real-time salinity monitoring.
 * Refactored to match the HydroLogic IoT aesthetic (DEVICES_USER.html).
 */
const SalinityGauge = ({ deviceId, size = 160 }) => {
  const { reading, loading, error } = useReadings(deviceId);

  // Data extraction: Prioritize 'salinity' but fallback to 'tds' as per hardware mapping
  const value = reading?.salinity ?? reading?.tds ?? 0;

  // Configuration from central constants
  const config = SENSOR_CONFIG[METRICS.TDS] || { min: 0, max: 100 };
  const min = config.min;
  const max = config.max;
  const unit = "PPT"; // As per mockup

  // 📐 SVG CALCULATIONS
  const strokeWidth = 12;
  const radius = 70; // Based on 160px size (80 is half)
  const viewBoxSize = 160;
  const center = viewBoxSize / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div
        className="relative flex items-center justify-center bg-white/40 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm animate-pulse"
        style={{ width: size, height: size }}
      >
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-500",
        error && "opacity-50 grayscale"
      )}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        <defs>
          <linearGradient id="salinity-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#0052cc", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#00c1fd", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          className="text-surface-container-highest"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="url(#salinity-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-bold text-on-background tracking-tighter">
          {value.toFixed(1)}
        </span>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
          {unit}
        </span>
      </div>

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase">Offline</span>
        </div>
      )}
    </div>
  );
};

export default SalinityGauge;
