import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * SystemAlertItem Component
 * Categorized alert card for the system feed.
 * Supports: info, warning, error.
 */
const SystemAlertItem = memo(({ title, description, time, type = "info" }) => {
  const configs = {
    info: {
      bg: "bg-blue-50/50",
      border: "border-blue-100/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: "info",
    },
    warning: {
      bg: "bg-orange-50/50",
      border: "border-orange-100/50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: "warning",
    },
    error: {
      bg: "bg-red-50/50",
      border: "border-red-100/50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: "error",
    },
  };

  const config = configs[type] || configs.info;

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl border transition-all hover:translate-x-1",
        config.bg,
        config.border
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
          config.iconBg,
          config.iconColor
        )}
      >
        <span className="material-symbols-outlined text-[20px] fill">{config.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-bold text-xs text-on-surface truncate pr-2">{title}</p>
          <span className="text-[9px] font-black text-outline uppercase whitespace-nowrap">
            {time}
          </span>
        </div>
        <p className="text-[10px] text-outline mt-1 leading-relaxed line-clamp-2">{description}</p>
      </div>
    </div>
  );
});

SystemAlertItem.displayName = "SystemAlertItem";

export default SystemAlertItem;
