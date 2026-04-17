import { cn } from "../../../utils/cn";

export const DeviceInfoRow = ({ label, value, icon: Icon, isMono = false, variant = "default" }) => (
  <div className="flex justify-between items-center py-1">
    <div className="flex items-center gap-2 text-slate-400">
      <Icon size={14} />
      <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </div>
    <span className={cn(
        "text-xs font-bold truncate ml-4", // Idinagdag ang truncate at margin-left
        variant === "highlight" ? "text-blue-600" : "text-slate-700",
        isMono ? "font-mono bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100" : ""
    )}>
        {value}
    </span>
  </div>
);