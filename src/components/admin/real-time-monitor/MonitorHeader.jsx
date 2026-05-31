import { memo } from "react";
import { Search, Bell, ChevronDown, RefreshCcw } from "lucide-react";

/**
 * COMPONENT: MonitorHeader
 * Mirrored from code1.html HeaderSection.
 */
const MonitorHeader = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8" data-purpose="header">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Real Time Monitor</h2>
          <div className="flex items-center px-2 py-0.5 bg-green-50 rounded-full border border-green-100 shadow-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-live" />
            <span className="text-[11px] font-bold text-green-600 uppercase">Live</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1 font-medium italic">
          Live overview of all resident devices and real-time readings.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Auto Refresh UI */}
        <div className="flex items-center bg-white rounded-xl border border-gray-200 px-4 py-2 gap-3 cursor-pointer hover:border-primary transition-colors shadow-sm group">
          <RefreshCcw className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          <div className="text-xs">
            <p className="text-gray-400 font-medium leading-none">Auto Refresh</p>
            <p className="text-gray-900 font-bold">10 sec</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        {/* Notifications Button */}
        <button className="p-2.5 bg-white border border-gray-200 rounded-xl relative hover:border-primary transition-colors shadow-sm group">
          <Bell className="h-6 w-6 text-gray-600 group-hover:text-primary" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
        </button>

        {/* Top Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-64 bg-white border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary border shadow-sm transition-all" 
            placeholder="Search device or resident..." 
            type="text" 
          />
        </div>
      </div>
    </div>
  );
};

export default memo(MonitorHeader);
