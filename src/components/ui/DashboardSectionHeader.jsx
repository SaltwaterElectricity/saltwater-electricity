import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * SectionHeader Component
 * Standardized header for layout sections with a title and a divider line.
 */
const DashboardSectionHeader = memo(({ title, variant = "primary", className }) => {
  const configs = {
    primary: {
      text: "text-primary bg-primary/5 border-primary/10",
      line: "bg-gradient-to-r from-primary/20 to-transparent",
    },
    neutral: {
      text: "text-slate-500 bg-white/50 border-slate-100",
      line: "bg-slate-200/50",
    },
  };

  const config = configs[variant] || configs.primary;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <h2
        className={cn(
          "text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border backdrop-blur-sm",
          config.text
        )}
      >
        {title}
      </h2>
      <div className={cn("h-[1px] flex-1", config.line)} />
    </div>
  );
});

DashboardSectionHeader.displayName = "DashboardSectionHeader";

export default DashboardSectionHeader;
