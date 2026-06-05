import { cn } from "../../../utils/cn";

/**
 * SummaryItem Component
 * Mirrors the assignment summary columns from code1.html.
 */
const SummaryItem = ({ label, value, highlight, className }) => (
  <div className={cn("flex flex-col min-w-0", className)}>
    <span className="block text-[10px] text-slate-400 font-medium mb-1 leading-none uppercase tracking-tight">
      {label}
    </span>
    <span
      className={cn(
        "text-xs font-bold truncate leading-tight",
        highlight ? "text-blue-600" : "text-slate-700"
      )}
      title={value}
    >
      {value}
    </span>
  </div>
);

export default SummaryItem;
