import { memo } from "react";
import { ClipboardList, ChevronRight } from "lucide-react";

/**
 * RequestManagementHeader Component
 * Renders the page header for Request Management.
 */
const RequestManagementHeader = memo(() => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-900/20">
          <ClipboardList size={28} />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Request <span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            System Operations <ChevronRight size={10} /> Device Provisioning
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Live Feed Active
          </span>
        </div>
      </div>
    </header>
  );
});

RequestManagementHeader.displayName = "RequestManagementHeader";

export default RequestManagementHeader;
