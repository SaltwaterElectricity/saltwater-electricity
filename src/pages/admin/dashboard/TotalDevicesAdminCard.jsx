import { memo } from "react";
import { cn } from "../../../utils/cn";

/**
 * TotalDevicesAdminCard Component (Admin Dashboard Exclusive)
 * Mirrors the specific design from dashboard.html
 */
const TotalDevicesAdminCard = memo(({ value }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[180px] relative overflow-hidden group">
      <div className="flex justify-between items-start w-full">
        <div className="p-2.5 bg-blue-50 text-primary rounded-lg">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            router
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full font-bold text-[11px]",
            "bg-blue-50 text-primary"
          )}
        >
          <span className="material-symbols-outlined text-[14px]">sensors</span>
          Live
        </div>
      </div>
      <div className="mt-4">
        <p className="text-outline text-[11px] font-bold uppercase tracking-wider">Total Devices</p>
        <h2 className="text-4xl font-extrabold text-on-surface mt-1">{value}</h2>
      </div>
      <div className="mt-auto pt-4 flex items-end justify-between">
        <p className="text-[11px] text-outline">Since last month</p>
        <div className="flex items-end gap-1 h-8">
          <div className="w-1.5 bg-primary/20 rounded-full h-1/3" />
          <div className="w-1.5 bg-primary/20 rounded-full h-1/2" />
          <div className="w-1.5 bg-primary/40 rounded-full h-2/3" />
          <div className="w-1.5 bg-primary/60 rounded-full h-3/4" />
          <div className="w-1.5 bg-primary rounded-full h-full" />
        </div>
      </div>
    </div>
  );
});

TotalDevicesAdminCard.displayName = "TotalDevicesAdminCard";

export default TotalDevicesAdminCard;
