import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * HealthDonutChart Component
 * SVG-based donut chart for visualizing system health or usage.
 */
const HealthDonutChart = memo(({ 
  score = 0, 
  title = "Health", 
  icon = "bolt",
  colorStart = "#0A2EFF",
  colorEnd = "#3D73FF",
  className 
}) => {
  // SVG Math
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className={cn("flex-1 flex items-center justify-center relative", className)}>
      <svg className="w-64 h-64 -rotate-90">
        <circle
          cx="128"
          cy="128"
          fill="transparent"
          r={radius}
          stroke="#E4E7EC"
          strokeWidth="16"
        />
        <circle
          cx="128"
          cy="128"
          fill="transparent"
          r={radius}
          stroke="url(#blueGradUnified)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="20"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="blueGradUnified" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: colorStart, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: colorEnd, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center text-white mb-2 shadow-lg">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span className="text-h1 font-extrabold text-on-surface font-display">
          {score}%
        </span>
        <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">
          {title}
        </span>
      </div>
    </div>
  );
});

HealthDonutChart.displayName = "HealthDonutChart";

export default HealthDonutChart;
