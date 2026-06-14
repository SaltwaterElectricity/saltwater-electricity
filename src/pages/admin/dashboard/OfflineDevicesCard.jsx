import { memo } from "react";
import { cn } from "../../../utils/cn";

/**
 * OfflineDevicesCard Component (Admin Dashboard Exclusive)
 * Mirrors the specific design from dashboard.html
 */
const OfflineDevicesCard = memo(({ value }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[180px] relative overflow-hidden group">
      <div className="flex justify-between items-start w-full">
        <div className="p-2.5 bg-red-50 text-red-500 rounded-lg">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            signal_wifi_off
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full font-bold text-[11px]",
            "bg-red-50 text-red-600"
          )}
        >
          <span className="material-symbols-outlined text-[14px]">
            wifi_off
          </span>
          Live
        </div>
      </div>
      <div className="mt-4">
        <p className="text-outline text-[11px] font-bold uppercase tracking-wider">
          Offline Devices
        </p>
        <h2 className="text-4xl font-extrabold text-on-surface mt-1">{value}</h2>
      </div>
      <div className="mt-auto pt-4 flex items-end justify-between">
        <p className="text-[11px] text-outline">Network status</p>
        <div className="flex items-end gap-1 h-8">
          <div className="w-1.5 bg-red-200 rounded-full h-3/5" />
          <div className="w-1.5 bg-red-300 rounded-full h-2/5" />
          <div className="w-1.5 bg-red-400 rounded-full h-4/5" />
          <div className="w-1.5 bg-red-500 rounded-full h-full" />
          <div className="w-1.5 bg-red-600 rounded-full h-3/4" />
        </div>
      </div>
    </div>
  );
});

OfflineDevicesCard.displayName = "OfflineDevicesCard";

export default OfflineDevicesCard;
