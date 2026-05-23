import { useState, useEffect, memo } from "react";
import { Timer } from "lucide-react";
import { getRemainingCancellationTime, formatCountdown } from "../../../utils/timeUtils";

/**
 * RequestAction Component
 * Handles the industry-standard cancellation lifecycle with live countdown.
 */
const RequestAction = memo(({ request, onCancelTrigger }) => {
  const [timeLeft, setTimeLeft] = useState(getRemainingCancellationTime(request.createdAt));
  const isPending = request.status === "pending";

  useEffect(() => {
    if (!isPending || timeLeft <= 0) return;

    const timer = setInterval(() => {
      const remaining = getRemainingCancellationTime(request.createdAt);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [request.createdAt, isPending, timeLeft]);

  // Logic: Show Cancel only if Pending and window is active
  if (isPending && timeLeft > 0) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onCancelTrigger(request)}
          className="px-4 py-1.5 bg-error/10 text-error border border-error/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          Cancel Request
        </button>
        <div className="flex items-center gap-1.5 text-outline opacity-70">
          <Timer size={10} className="animate-pulse" />
          <span className="text-[9px] font-mono font-bold tracking-tight">
            Ends in: {formatCountdown(timeLeft)}
          </span>
        </div>
      </div>
    );
  }

  // Fallback: If approved/expired, show standard View button (Locked/Disabled context)
  return (
    <button
      disabled
      className="px-4 py-1.5 border border-outline-variant/30 text-outline rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed bg-surface-container-low/50"
    >
      Locked for Review
    </button>
  );
});

RequestAction.displayName = "RequestAction";

export default RequestAction;
