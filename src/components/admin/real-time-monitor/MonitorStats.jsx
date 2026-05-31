import { memo } from "react";
import { Bolt, Droplets } from "lucide-react";

/**
 * COMPONENT: MonitorStats
 * Mirrored from code1.html TopSummaryCards.
 * Contains Total Voltage and Total Salinity horizontal cards.
 */
const MonitorStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Total Voltage Card */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mr-6 shrink-0 border border-blue-100 transition-transform group-hover:scale-110">
          <Bolt className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Voltage</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalVoltage}</h3>
            <span className="text-lg font-bold text-slate-300 italic">V</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">All real-time voltage</p>
        </div>
        <div className="flex items-end space-x-1 h-12 ml-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" data-purpose="mini-graph">
          <div className="w-1.5 bg-blue-100 rounded-full h-4" />
          <div className="w-1.5 bg-blue-200 rounded-full h-6" />
          <div className="w-1.5 bg-blue-300 rounded-full h-8" />
          <div className="w-1.5 bg-blue-400 rounded-full h-12" />
          <div className="w-1.5 bg-primary rounded-full h-10" />
          <div className="w-1.5 bg-blue-200 rounded-full h-5" />
        </div>
      </div>

      {/* Total Salinity Card */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mr-6 shrink-0 border border-purple-100 transition-transform group-hover:scale-110">
          <Droplets className="h-7 w-7 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Salinity</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalSalinity}</h3>
            <span className="text-sm font-bold text-slate-300 italic uppercase">ppm</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">All real-time salinity</p>
        </div>
        <div className="flex items-end space-x-1 h-12 ml-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" data-purpose="mini-graph">
          <div className="w-1.5 bg-purple-100 rounded-full h-8" />
          <div className="w-1.5 bg-purple-200 rounded-full h-10" />
          <div className="w-1.5 bg-purple-300 rounded-full h-12" />
          <div className="w-1.5 bg-purple-400 rounded-full h-8" />
          <div className="w-1.5 bg-purple-600 rounded-full h-9" />
          <div className="w-1.5 bg-purple-200 rounded-full h-6" />
        </div>
      </div>
    </div>
  );
};

export default memo(MonitorStats);
