import { cn } from "../../utils/cn";
import { memo } from "react";

/**
 * MetricCard Component
 * Individual bento grid card for system metrics.
 * Follows Glassmorphism and 8-point grid rules.
 */
const MetricCard = memo(({ title, value, status, icon, colorClass = "text-blue-500" }) => {
  return (
    <div className="glass-panel p-md hover:translate-y-[-4px] transition-transform shadow-sm group">
      <div className="flex items-center justify-between mb-sm">
        <span className={cn("material-symbols-outlined", colorClass)}>{icon}</span>
        <span className="text-xs font-bold text-slate-400 font-['Space_Grotesk'] uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="text-h2 font-h2 text-primary group-hover:text-secondary-container transition-colors font-['Space_Grotesk']">
        {value}
      </div>
      <div className="text-[10px] font-bold text-tertiary-fixed-variant mt-xs font-['Inter'] uppercase tracking-widest">
        {status}
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
