import { memo } from "react";

/**
 * SystemHealthGauge Component
 * A triple-ring circular gauge for high-density status visualization.
 * Aligned with AlonKuryente Dashboard visual language.
 */
const SystemHealthGauge = memo(({ voltage = 90, salinity = 80, current = 70, overall = 92 }) => {
  // SVG Calculations
  const size = 100;
  const center = 50;
  
  const rings = [
    { radius: 42, value: voltage, color: "#2563eb", label: "Voltage", dash: 263.8 },
    { radius: 34, value: salinity, color: "#60a5fa", label: "Salinity", dash: 213.6 },
    { radius: 26, value: current, color: "#bfdbfe", label: "Current", dash: 163.3 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-full p-3 transition-all hover:shadow-md">
      <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant text-center mb-1">
        System Health
      </h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-48 h-48 md:w-36 md:h-36">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {rings.map((ring) => {
              const offset = ring.dash - (ring.value / 100) * ring.dash;
              
              return (
                <g key={ring.label}>
                  {/* Background Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    fill="none"
                    r={ring.radius}
                    stroke="#f0f4f9"
                    strokeWidth="6"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx={center}
                    cy={center}
                    fill="none"
                    r={ring.radius}
                    stroke={ring.color}
                    strokeWidth="6"
                    strokeDasharray={ring.dash}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </g>
              );
            })}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-extrabold tracking-tighter text-4xl text-primary leading-none">
              {overall}%
            </span>
            <span className="text-[11px] font-black text-primary uppercase mt-1">
              {overall >= 90 ? "GOOD" : overall >= 75 ? "FAIR" : "CRITICAL"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 space-y-1 mt-1 px-2">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: ring.color }} 
              />
              <span className="font-bold text-[11px] text-on-surface uppercase tracking-tight">
                {ring.label}
              </span>
            </div>
            <p className="text-[10px] text-outline font-extrabold">{ring.value}%</p>
          </div>
        ))}
      </div>
    </div>
  );
});

SystemHealthGauge.displayName = "SystemHealthGauge";

export default SystemHealthGauge;
