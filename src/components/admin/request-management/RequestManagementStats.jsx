import { memo } from "react";
import { ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * StatCard Component
 * Helper component for individual stat cards matching code.html design.
 */
const StatCard = ({ label, value, percentage, icon: Icon, colorClass, shadowClass }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-slate-50 flex items-start justify-between min-h-[140px] transition-all hover:shadow-lg">
      <div className="flex gap-4">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0", colorClass, shadowClass)}>
          <Icon className="text-white" size={30} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{percentage}% of total</p>
        </div>
      </div>
    </div>
  );
};

/**
 * RequestManagementStats Component
 * Renders the statistics overview for Request Validation.
 */
const RequestManagementStats = memo(({ requests }) => {
  const total = requests.length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const declined = requests.filter((r) => r.status === "declined").length;

  const getPercentage = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="All Requests"
        value={total}
        percentage={100}
        icon={ClipboardList}
        colorClass="bg-[#0066ff]"
        shadowClass="shadow-blue-500/30"
      />
      <StatCard
        label="Approved Request"
        value={approved}
        percentage={getPercentage(approved)}
        icon={CheckCircle2}
        colorClass="bg-[#10b981]"
        shadowClass="shadow-emerald-500/30"
      />
      <StatCard
        label="Pending Request"
        value={pending}
        percentage={getPercentage(pending)}
        icon={Clock}
        colorClass="bg-[#f97316]"
        shadowClass="shadow-orange-500/30"
      />
      <StatCard
        label="Denied Request"
        value={declined}
        percentage={getPercentage(declined)}
        icon={XCircle}
        colorClass="bg-[#ef4444]"
        shadowClass="shadow-rose-500/30"
      />
    </section>
  );
});

RequestManagementStats.displayName = "RequestManagementStats";

export default RequestManagementStats;
