import { useReadings } from '../../hooks';
import { cn } from '../../utils/cn';

/**
 * BulbPowerUsageGauge Component
 * Visualizes real-time power consumption (Watts).
 * Calculated from voltage and bulb_ma telemetry.
 */
const BulbPowerUsageGauge = ({ deviceId, size = 220 }) => {
  const { reading, loading, error } = useReadings(deviceId);
  
  // LOGIC: Power (W) = (V * mA) / 1000
  const voltage = reading?.voltage || 0;
  const currentMA = reading?.bulb_ma || 0;
  const power = (voltage * currentMA) / 1000;
  
  const maxWatts = 100; // Requirement: 0-100 Watts range

  // 📐 SVG CALCULATIONS (Semi-circle)
  const strokeWidth = 14;
  const radius = (size / 2) - strokeWidth;
  const circumference = Math.PI * radius;
  const percentage = Math.min(Math.max((power / maxWatts) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <div 
        className="relative flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl animate-pulse"
        style={{ width: '100%', maxWidth: size, height: size / 1.6 }}
      >
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative flex flex-col items-center justify-end overflow-hidden p-8",
        "bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl",
        "transition-all duration-500 hover:scale-[1.02]"
      )}
      style={{ width: '100%', maxWidth: size, height: size / 1.5 }}
    >
      {/* INNER GLOW EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* GAUGE SVG */}
      <div className="relative w-full aspect-[2/1] flex items-center justify-center">
        <svg 
          className="absolute top-0 w-full h-full"
          viewBox={`0 0 ${size} ${size / 2}`}
        >
          <defs>
            <linearGradient id="power-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
              <stop offset="100%" stopColor="#f59e0b" /> {/* Amber-500 */}
            </linearGradient>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="3" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
            fill="transparent"
            className="stroke-slate-200/20"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <path
            d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
            fill="transparent"
            stroke="url(#power-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
                filter: 'url(#arc-glow)',
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            }}
          />
        </svg>

        {/* CENTER TYPOGRAPHY */}
        <div className="flex flex-col items-center justify-center mt-6">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
            Power Usage
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tighter text-slate-900">
              {power.toFixed(1)}
            </span>
            <span className="text-sm font-black text-amber-500">W</span>
          </div>
        </div>
      </div>

      {/* RANGE LABELS */}
      <div className="w-full flex justify-between mt-4 px-2">
        <span className="text-[8px] font-bold text-slate-400">0W</span>
        <span className="text-[8px] font-bold text-slate-400">100W</span>
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-md flex items-center justify-center p-4">
          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Sensor Offline</span>
        </div>
      )}
    </div>
  );
};

export default BulbPowerUsageGauge;
