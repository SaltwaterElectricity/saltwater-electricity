import { memo } from "react";
import { Box, Wifi, WifiOff } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * COMPONENT: MonitorMetrics
 * Mirrored from code1.html BottomSummaryCards.
 * Contains Total, Online, and Inactive device cards.
 * Now features dynamic mini-graphs that scale with actual unit counts.
 */
const MonitorMetrics = ({ stats }) => {
  const getBars = (value, maxVal, colorClass, prefix) => {
    const intensity = maxVal > 0 ? Math.min(1, value / maxVal) : 0;
    return Array.from({ length: 4 }).map((_, i) => {
      const height = Math.max(15, (intensity * 70) + (Math.sin(i * 2) * 15) + 15);
      return (
        <div
          key={`metrics-bar-${prefix}-${height}-${Math.random()}`}
          className={cn(
            "w-1 rounded-full transition-all duration-1000 ease-out",
            colorClass,
            i === 3 && "opacity-100 scale-y-110"
          )}
          style={{ 
            height: `${height}%`,
            opacity: 0.3 + (i * 0.2)
          }}
        />
      );
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 border border-blue-100 transition-transform group-hover:rotate-6">
          <Box className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Total Devices</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
          <p className="text-[10px] text-gray-400">Across all locations</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 group-hover:opacity-100 transition-opacity">
          {getBars(stats.total, stats.total, "bg-primary", "total")}
        </div>
      </div>

      {/* Online Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4 border border-green-100 transition-transform group-hover:rotate-6">
          <Wifi className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">Online Devices</p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.online}</h3>
          <p className="text-[10px] text-gray-400">Active devices</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 group-hover:opacity-100 transition-opacity">
          {getBars(stats.online, stats.total, "bg-green-500", "online")}
        </div>
      </div>

      {/* Inactive Devices */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mr-4 border border-slate-100 transition-transform group-hover:rotate-6">
          <WifiOff className="h-6 w-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">
            Inactive Devices
          </p>
          <h3 className="text-2xl font-bold text-gray-900">{stats.offline}</h3>
          <p className="text-[10px] text-gray-400">Inactive devices</p>
        </div>
        <div className="flex items-end space-x-1 h-8 ml-2 group-hover:opacity-100 transition-opacity">
          {getBars(stats.offline, stats.total, "bg-slate-400", "offline")}
        </div>
      </div>
    </div>
  );
};

export default memo(MonitorMetrics);
