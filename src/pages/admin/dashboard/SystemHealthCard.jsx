import { memo } from "react";

/**
 * SystemHealthCard Component (Admin Dashboard Exclusive)
 * Mirrors the specific design from dashboard.html
 */
const SystemHealthCard = memo(({ value, status = "Optimal" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col min-h-[180px] relative overflow-hidden group">
      <div className="flex justify-between items-start w-full">
        <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
          <span
            className="material-symbols-outlined text-[24px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            ecg_heart
          </span>
        </div>
        <div className="flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-full text-teal-600 font-bold text-[11px]">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          Live
        </div>
      </div>
      <div className="mt-4">
        <p className="text-outline text-[11px] font-bold uppercase tracking-wider">System Health</p>
        <h2 className="text-4xl font-extrabold text-on-surface mt-1">{value}%</h2>
      </div>
      <div className="mt-auto pt-4 w-full">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-outline">Overall efficiency</span>
          <span className="text-[11px] font-bold text-teal-600">{status}</span>
        </div>
        <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-1000"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
});

SystemHealthCard.displayName = "SystemHealthCard";

export default SystemHealthCard;
