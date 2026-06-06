import { memo } from "react";
import { FileText, ShieldCheck, Smartphone, AlertTriangle } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * AuditLogMetrics Component
 * Displays summary metrics with circular progress indicators.
 */
const AuditLogMetrics = ({ metrics }) => {
  const data = [
    {
      label: "Total Log Entries",
      value: metrics.total || 0,
      subLabel: "Total Logs",
      icon: FileText,
      color: "blue",
      percentage: 100,
      isPrimary: false,
      isUppercaseSub: true,
    },
    {
      label: "Security Events",
      value: metrics.security || 0,
      subLabel: "Security Events",
      icon: ShieldCheck,
      color: "green",
      percentage: metrics.securityPercentage || 0,
      isUppercaseSub: true,
    },
    {
      label: "Device Activities",
      value: metrics.device || 0,
      subLabel: "Device Events",
      icon: Smartphone,
      color: "purple",
      percentage: metrics.devicePercentage || 0,
      isUppercaseSub: true,
    },
    {
      label: "Failed Actions",
      value: metrics.failed || 0,
      subLabel: "Failed Operations",
      icon: AlertTriangle,
      color: "red",
      percentage: metrics.failedPercentage || 0,
      isUppercaseSub: true,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </section>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon, color, percentage }) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      stroke: "text-blue-500",
      border: "border-blue-600",
      track: "text-gray-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      stroke: "text-green-500",
      border: "border-blue-600",
      track: "text-green-50",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      stroke: "text-purple-600",
      border: "border-blue-600",
      track: "text-purple-50",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      stroke: "text-red-500",
      border: "border-blue-600",
      track: "text-red-50",
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={cn(
        "bg-white p-6 rounded-2xl shadow-sm border-2 flex items-center justify-between transition-all hover:shadow-md h-full",
        theme.border
      )}
    >
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              theme.bg,
              theme.text
            )}
          >
            <Icon size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">{label}</p>
            <h3
              className={cn(
                "font-bold text-slate-900",
                label === "Total Log Entries" ? "text-3xl" : "text-2xl"
              )}
            >
              {value}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{subLabel}</p>
          </div>
        </div>
      </div>

      <div className="relative w-[70px] h-[70px] flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className={theme.track}
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={theme.stroke}
            strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className={cn("absolute text-sm font-bold", theme.text)}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default memo(AuditLogMetrics);
