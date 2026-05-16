import { cn } from "../../utils/cn";
import { memo } from "react";

/**
 * MetricCard Component
 * High-density bento grid card for system metrics.
 * Aligned with AlonKuryente Dashboard visual language.
 */
const MetricCard = memo(
  ({
    title,
    value,
    status,
    statusValue,
    icon,
    colorClass = "text-primary",
    bgIconClass = "bg-blue-50",
    trend,
    trendValue,
    sparkline = true,
    isHealth = false,
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[180px] relative overflow-hidden group hover:shadow-md transition-shadow">
        {/* Header: Icon and Trend */}
        <div className="flex justify-between items-start w-full">
          <div className={cn("p-2.5 rounded-lg transition-colors", bgIconClass, colorClass)}>
            <span className="material-symbols-outlined text-[24px] fill">{icon}</span>
          </div>

          {trendValue && (
            <div
              className={cn(
                "flex items-center gap-0.5 px-2 py-1 rounded-full font-black text-[10px] tracking-tight",
                trend === "up"
                  ? "bg-green-50 text-green-600"
                  : trend === "down"
                    ? "bg-red-50 text-red-600"
                    : "bg-orange-50 text-orange-600"
              )}
            >
              <span className="material-symbols-outlined text-[14px]">
                {trend === "up"
                  ? "arrow_drop_up"
                  : trend === "down"
                    ? "arrow_drop_down"
                    : "trending_flat"}
              </span>
              {trendValue}
            </div>
          )}
        </div>

        {/* Body: Title and Value */}
        <div className="mt-4">
          <p className="text-outline text-[11px] font-bold uppercase tracking-wider">{title}</p>
          <h2 className="text-4xl font-extrabold text-on-surface mt-1 tracking-tight">{value}</h2>
        </div>

        {/* Footer: Status and Sparkline/Progress */}
        <div className="mt-auto pt-4 flex flex-col w-full">
          {isHealth ? (
            <>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-outline">{status}</span>
                <span className={cn("text-[11px] font-bold", colorClass)}>
                  {statusValue || "Optimal"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: value }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-end justify-between w-full">
              <p className="text-[11px] text-outline">{status}</p>
              {sparkline && (
                <div className="flex items-end gap-1 h-8">
                  <div className="w-1.5 bg-primary/20 rounded-full h-1/3" />
                  <div className="w-1.5 bg-primary/20 rounded-full h-1/2" />
                  <div className="w-1.5 bg-primary/40 rounded-full h-2/3" />
                  <div className="w-1.5 bg-primary/60 rounded-full h-3/4" />
                  <div className="w-1.5 bg-primary rounded-full h-full" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";

export default MetricCard;
