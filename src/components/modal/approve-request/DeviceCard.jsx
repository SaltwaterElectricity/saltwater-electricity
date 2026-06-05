import { CheckCircle2 } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * DeviceCard Component
 * Mirrors the device rows from code1.html with radio selection.
 */
const DeviceCard = ({ device, isSelected, onSelect, formatDate }) => (
  <div
    onClick={onSelect}
    className={cn(
      "relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
      isSelected
        ? "border-blue-500 bg-blue-50/30"
        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50"
    )}
  >
    <div className="flex items-center gap-3 flex-1">
      {/* Radio Input Simulation */}
      <div
        className={cn(
          "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
          isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
        )}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center p-1 border border-slate-200/50 shrink-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUDfiBeldQ_VR_ACyg5kToBbfu8cYVsSY8LzrhRwvMaCDqX8cu6NnvpU1LSNvfI1QxxkRRrX5cy-R_Wxq1LhajmUi_iX1_UW8B6QtjkiQ9XvoP_IxdyZ7147XwjNRh0vif3OZEBDQeeUh-anwgX5kHbTUB1_w3qtHIxx4j37RXi4LlsB-_cDW6bfA2Duoj4rQu5neJIPQBfAmJspgUvS5si0goEjbBuLO6-18JvyQs_XWBKBL55MrzF6UvThPkOW5-En5044hkicBzyA"
          alt="ESM Logo"
          className="max-h-full w-auto object-contain"
        />
      </div>

      <div className="min-w-0">
        <h3 className="text-xs font-bold text-slate-800 leading-none mb-0.5">{device.device_id}</h3>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none mb-0.5 truncate">
          {device.device_name || "sw-unit-snq"}
        </p>
        <p className="text-[9px] text-slate-400 leading-none truncate">
          SN: {device.serial_number || "A533-XXXX-XXXX"}
        </p>
      </div>
    </div>

    <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-[9px] font-bold text-green-600 uppercase">Available</span>
      </div>
      <span className="text-[9px] text-slate-400 text-right leading-tight">
        Created On:<br />{formatDate ? formatDate(device.createdAt) : "May 20, 2023"}
      </span>
    </div>

    {isSelected && (
      <div className="absolute -right-1 -top-1">
        <div className="bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
          <CheckCircle2 size={10} />
        </div>
      </div>
    )}
  </div>
);

export default DeviceCard;
