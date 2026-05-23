import { cn } from "../../utils/cn";
import { memo } from "react";

/**
 * SummaryCard Component
 * High-fidelity KPI card supporting multiple visual variants (Icon-based or Sparkline-based).
 */
const SummaryCard = memo(
  ({
    title,
    value,
    subtitle,
    icon,
    variant = "icon", // 'icon' | 'sparkline'
    colorClass = "text-primary",
    bgClass = "bg-white",
    iconBgClass = "primary-gradient",
    trend,
    trendValue,
    className,
  }) => {
    if (variant === "sparkline") {
      return (
        <div
          className={cn(
            "bg-cardBg p-8 rounded-2xl shadow-premium flex items-center justify-between border border-white/40 group hover:border-primary/20 transition-all duration-500",
            className
          )}
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {title}
            </p>
            <h3 className="text-5xl font-black text-slate-900 tabular-nums font-display italic">
              {value}
            </h3>
          </div>
          {/* Sparkline visual */}
          <div className="flex items-end space-x-1 h-12">
            <div className="w-1.5 bg-slate-100 rounded-full h-4" />
            <div className="w-1.5 bg-slate-200 rounded-full h-6" />
            <div className="w-1.5 bg-slate-300 rounded-full h-10" />
            <div className="w-1.5 bg-primary rounded-full h-12 shadow-[0_0_15px_rgba(10,46,255,0.4)] group-hover:scale-y-110 transition-transform origin-bottom" />
            <div className="w-1.5 bg-primary/60 rounded-full h-8" />
            <div className="w-1.5 bg-primary/40 rounded-full h-5" />
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "rounded-2xl p-6 flex items-center shadow-[0_12px_32px_4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80]",
          bgClass,
          className
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white mr-6 shadow-lg transition-transform duration-500 group-hover:scale-110",
            iconBgClass
          )}
        >
          {typeof icon === "string" ? (
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
          ) : (
            icon
          )}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {title}
          </p>
          {subtitle && (
            <p
              className={cn(
                "flex items-center gap-1.5 text-[12px] font-semibold mb-2 font-body-md",
                colorClass
              )}
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", colorClass.replace("text-", "bg-"))}
              />
              {subtitle}
            </p>
          )}
          <h4 className="text-4xl font-extrabold text-on-surface leading-none font-display">
            {value}
          </h4>
          {trendValue && (
            <p
              className={cn(
                "flex items-center gap-1 text-[12px] font-semibold mt-1 font-body-md",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              <span className="material-symbols-outlined text-sm">
                {trend === "up" ? "trending_up" : "trending_down"}
              </span>
              {trendValue}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SummaryCard.displayName = "SummaryCard";

export default SummaryCard;
