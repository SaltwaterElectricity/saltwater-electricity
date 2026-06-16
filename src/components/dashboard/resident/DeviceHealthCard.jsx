import { memo } from "react";
import { cn } from "../../../utils/cn";

/**
 * DeviceHealthCard Component (Resident Dashboard Exclusive)
 * Mirrors the specific design from user-dashboard.html
 */
const DeviceHealthCard = memo(({ value, trendValue, trend }) => {
  const hasTrend = trendValue !== undefined && trend !== undefined;

  return (
    <div className="bg-white rounded-2xl p-6 flex items-center shadow-[0_12px_32px_-4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80] min-w-0">
      <div className="flex-shrink-0 w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white mr-6 shadow-lg">
        <span
          className="material-symbols-outlined text-[32px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          security
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 truncate">
          Device Health
        </p>
        <h4 className="text-4xl font-extrabold text-on-surface leading-none mb-1 font-display truncate">
          {value}%
        </h4>
        {hasTrend && (
          <div
            className={cn(
              "flex items-center gap-1 text-[12px] font-semibold",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            <span className="material-symbols-outlined text-sm">
              {trend === "up" ? "trending_up" : "trending_down"}
            </span>
            <span className="truncate">
              {trendValue.startsWith("+") || trendValue.startsWith("-")
                ? trendValue
                : `${trend === "up" ? "+" : "-"} ${trendValue}`}
            </span>
          </div>
        )}
      </div>
      {/* Decorative Bars - Hidden on medium/large screens where 3-column layout is too tight */}
      <div className="flex-shrink-0 flex items-end gap-1 h-12 ml-4 opacity-60 md:hidden xl:flex">
        <div className="w-1.5 bg-primary/30 h-1/2 rounded-full" />
        <div className="w-1.5 bg-primary/40 h-1/3 rounded-full" />
        <div className="w-1.5 bg-primary/50 h-full rounded-full" />
        <div className="w-1.5 bg-primary/40 h-3/4 rounded-full" />
        <div className="w-1.5 bg-primary h-[90%] rounded-full" />
      </div>
    </div>
  );
});

DeviceHealthCard.displayName = "DeviceHealthCard";

export default DeviceHealthCard;
