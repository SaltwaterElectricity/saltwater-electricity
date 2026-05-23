import { memo } from "react";
import { Users, ShieldCheck, Home } from "lucide-react";

/**
 * UserManagementStats Component
 * Renders the summary cards for User Management.
 */
const UserManagementStats = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Users Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <Users className="text-[#3D73FF]" size={28} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            Total Users
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

      {/* Admin Users Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <ShieldCheck className="text-[#10B981]" size={28} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            Admin Users
          </p>
          <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.admins}</h4>
        </div>
        <div className="flex items-end gap-[3px] h-10 self-end mb-1">
          {[20, 40, 60, 80, 100].map((h) => (
            <div
              key={`admin-bar-${h}`}
              className="w-1 bg-[#10B981] rounded-t-sm"
              style={{ height: `${h}%`, opacity: h / 100 }}
            />
          ))}
        </div>
      </div>

      {/* Household Users Card */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
        <div className="w-14 h-14 bg-[#F5F3FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
          <Home className="text-[#7C3AED]" size={28} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
            Household Users
          </p>
          <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">
            {stats.residents}
          </h4>
        </div>
        <div className="flex items-end gap-[3px] h-10 self-end mb-1">
          {[10, 30, 50, 75, 95].map((h) => (
            <div
              key={`resident-bar-${h}`}
              className="w-1 bg-[#7C3AED] rounded-t-sm"
              style={{ height: `${h}%`, opacity: h / 100 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

UserManagementStats.displayName = "UserManagementStats";

export default UserManagementStats;
