import { memo } from "react";
import { Activity } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * EmptyState Component
 * High-fidelity placeholder for empty data views.
 */
const EmptyState = memo(({ 
  icon: Icon = Activity, 
  title, 
  description, 
  actionText, 
  onAction,
  className 
}) => {
  return (
    <div className={cn(
      "bg-white/40 backdrop-blur-sm p-16 md:p-32 text-center rounded-[48px] border-2 border-dashed border-slate-200 relative z-10 animate-fade-in flex flex-col items-center",
      className
    )}>
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-inner">
        <Icon size={32} />
      </div>
      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
        {title}
      </p>
      {description && (
        <p className="text-slate-400/70 text-[10px] mt-2 max-w-[200px] leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-8 bg-primary/10 text-primary px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";

export default EmptyState;
