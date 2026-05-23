import { memo } from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * StatItem Component
 * Helper component for individual stat cards.
 */
const StatItem = ({ label, value, unit, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
          colors[color]
        )}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900 tabular-nums">
          {value}
          <span className="text-xs ml-1 text-slate-400 font-bold">{unit}</span>
        </p>
      </div>
    </div>
  );
};

/**
 * RequestManagementStats Component
 * Renders the statistics overview for Request Management.
 */
const RequestManagementStats = memo(({ requests }) => {
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    resolutionRate: requests.length
      ? Math.round(
          (requests.filter((r) => r.status !== "pending").length / requests.length) * 100
        )
      : 0,
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatItem label="Total Requests" value={stats.total} icon={ClipboardList} color="blue" />
      <StatItem label="Pending Review" value={stats.pending} icon={Clock} color="amber" />
      <StatItem
        label="Resolution Rate"
        value={stats.resolutionRate}
        unit="%"
        icon={CheckCircle2}
        color="emerald"
      />
    </section>
  );
});

RequestManagementStats.displayName = "RequestManagementStats";

export default RequestManagementStats;
