import { memo } from "react";

/**
 * ResidentStats Component
 * Renders the summary cards for Resident Management.
 */
const ResidentStats = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Users Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-[#3D73FF] text-[28px]">person</span>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            Total HOUSEHOLD USER
          </p>
          <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.total}</h4>
        </div>
        <div className="flex items-end gap-[3px] h-10 self-end mb-1">
          {[15, 25, 45, 65, 90].map((h) => (
            <div
              key={`total-bar-${h}`}
              className="w-1 bg-[#3D73FF] rounded-t-sm"
              style={{ height: `${h}%`, opacity: h / 100 }}
            />
          ))}
        </div>
      </div>

      {/* Active Residents Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-[#10B981] text-[28px]">
            admin_panel_settings
          </span>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            ACTIVE RESIDENT&apos;S
          </p>
          <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.online}</h4>
        </div>
        <div className="flex items-end gap-[3px] h-10 self-end mb-1">
          {[20, 40, 60, 80, 100].map((h) => (
            <div
              key={`active-bar-${h}`}
              className="w-1 bg-[#10B981] rounded-t-sm"
              style={{ height: `${h}%`, opacity: h / 100 }}
            />
          ))}
        </div>
      </div>

      {/* Offline Residents Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#F5F3FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-[#7C3AED] text-[28px]">home_pin</span>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            OFFLINE RESIDENT&apos;S
          </p>
          <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.offline}</h4>
        </div>
        <div className="flex items-end gap-[3px] h-10 self-end mb-1">
          {[10, 30, 50, 75, 95].map((h) => (
            <div
              key={`offline-bar-${h}`}
              className="w-1 bg-[#7C3AED] rounded-t-sm"
              style={{ height: `${h}%`, opacity: h / 100 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

ResidentStats.displayName = "ResidentStats";

export default ResidentStats;
