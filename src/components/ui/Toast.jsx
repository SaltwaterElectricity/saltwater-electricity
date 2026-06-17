import { useEffect, memo } from "react";
import { cn } from "../../utils/cn";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

const Toast = ({ message, type = "success", isOpen, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isOpen) {
      const finalDuration = type === "success" ? duration : duration + 5000;
      const timer = setTimeout(onClose, finalDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration, type]);

  if (!isOpen) return null;

  const styles = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    error: "bg-red-50 border-red-100 text-red-800",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
  };

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
  };

  const titles = {
    success: "Success!",
    error: "System Error",
    warning: "Warning!",
  };

  const Icon = icons[type];

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-10 duration-300 w-full max-w-fit px-4">
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl min-w-[320px] max-w-lg",
          styles[type]
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <div className="flex flex-col">
          <p className="text-sm font-bold leading-tight capitalize">{titles[type]}</p>
          <p className="text-xs opacity-90 leading-relaxed mt-1">
            {typeof message === "object"
              ? message?.message || "An unexpected error occurred"
              : message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 opacity-50 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

const MemoizedToast = memo(Toast);
export default MemoizedToast;
