import { memo } from "react";
import { Server, Signal, WifiOff } from "lucide-react";

/**
 * COMPONENT: MonitorMetrics
 * Mirrored from code1.html BottomSummaryCards.
 * Contains Total, Online, and Inactive device cards.
 */
const MonitorMetrics = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 border border-blue-100 transition-transform group-hover:rotate-6">
          <Server className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Total Devices</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-[10px] text-gray-400">Across all locations</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
          <div className="w-1 bg-blue-100 rounded-full h-3" />
          <div className="w-1 bg-blue-200 rounded-full h-4" />
          <div className="w-1 bg-blue-300 rounded-full h-6" />
          <div className="w-1 bg-primary rounded-full h-8" />
        </div>
      </div>

      {/* Online Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4 border border-green-100 transition-transform group-hover:rotate-6">
          <Signal className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Online Devices</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.online}</h3>
          <p className="text-[10px] text-gray-400">Active devices</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
          <div className="w-1 bg-green-100 rounded-full h-5" />
          <div className="w-1 bg-green-200 rounded-full h-7" />
          <div className="w-1 bg-green-500 rounded-full h-8" />
          <div className="w-1 bg-green-200 rounded-full h-4" />
        </div>
      </div>

      {/* Inactive Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 border border-slate-100 transition-transform group-hover:rotate-6">
          <WifiOff className="h-6 w-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Inactive Devices</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.offline}</h3>
          <p className="text-[10px] text-gray-400">Inactive devices</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
          <div className="w-1 bg-gray-100 rounded-full h-6" />
          <div className="w-1 bg-gray-200 rounded-full h-8" />
          <div className="w-1 bg-gray-300 rounded-full h-5" />
          <div className="w-1 bg-gray-200 rounded-full h-2" />
        </div>
      </div>
    </div>
  );
};

export default memo(MonitorMetrics);
