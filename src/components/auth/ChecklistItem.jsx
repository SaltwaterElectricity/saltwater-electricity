import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * COMPONENT: ChecklistItem
 * Used to display individual security requirement checks (e.g., 8+ characters).
 * Refined to align with the premium Material Design 3 aesthetic in legacy-designs/code1.html.
 */
const ChecklistItem = ({ label, isValid }) => (
  <div
    className={cn(
      "flex items-center gap-2.5 transition-all duration-500",
      isValid ? "opacity-100 translate-x-0" : "opacity-40 -translate-x-0.5"
    )}
  >
    <div className="relative flex items-center justify-center">
      <CheckCircle2
        size={18}
        className={cn(
          "transition-all duration-500",
          isValid ? "text-success scale-110" : "text-slate-200 scale-100"
        )}
      />
      {isValid && (
        <div className="absolute inset-0 bg-success/20 rounded-full blur-md animate-pulse" />
      )}
    </div>
    <span
      className={cn(
        "text-[11px] font-bold tracking-tight transition-colors duration-500 uppercase",
        isValid ? "text-on-surface" : "text-outline/70"
      )}
    >
      {label}
    </span>
  </div>
);

export default memo(ChecklistItem);
