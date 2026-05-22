import { memo } from "react";
import { ClipboardList } from "lucide-react";

/**
 * RequestDeviceCard Component (Resident Dashboard Exclusive)
 * Mirrors the specific design from user-dashboard.html
 */
const RequestDeviceCard = memo(({ value, status = "Pending" }) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center shadow-[0_12px_32px_-4px_rgba(10,46,255,0.04)] border border-[#e4e7ec80] min-w-0">
      <div className="flex-shrink-0 w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white mr-6 shadow-lg">
        <ClipboardList size={32} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 truncate">
          Request Device
        </p>
        <p className="flex items-center gap-1.5 text-orange-500 text-[12px] font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
          <span className="truncate">{status}</span>
        </p>
        <h4 className="text-4xl font-extrabold text-on-surface leading-none font-display truncate">
          {value}
        </h4>
      </div>
      {/* Decorative Bars - Hidden on medium/large screens where 3-column layout is too tight */}
      <div className="flex-shrink-0 flex items-end gap-1 h-12 ml-4 opacity-60 md:hidden xl:flex">
        <div className="w-1.5 bg-primary/30 h-1/3 rounded-full" />
        <div className="w-1.5 bg-primary/40 h-2/3 rounded-full" />
        <div className="w-1.5 bg-primary/50 h-1/2 rounded-full" />
        <div className="w-1.5 bg-primary/40 h-3/4 rounded-full" />
        <div className="w-1.5 bg-primary h-full rounded-full" />
      </div>
    </div>
  );
});

RequestDeviceCard.displayName = "RequestDeviceCard";

export default RequestDeviceCard;
