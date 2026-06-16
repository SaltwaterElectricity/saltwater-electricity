import { memo } from "react";
import { Zap, FlaskConical } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * COMPONENT: MonitorStats
 * Mirrored from code1.html TopSummaryCards.
 * Contains Total Voltage and Total Salinity horizontal cards.
 * Now features dynamic mini-graphs reflective of actual system totals.
 */
const MonitorStats = ({ stats }) => {
  // Logic to generate dynamic bars that reflect the scale of the system totals
  const getBars = (value, maxVal, color, prefix) => {
    const intensity = Math.min(1, value / maxVal);
    return Array.from({ length: 6 }).map((_, i) => {
      const height = Math.max(10, (intensity * 60) + (Math.sin(i * 1.5) * 20) + 20);
      return (
        <div
          key={`stat-bar-${prefix}-${height}-${i === 4 ? 'highlight' : 'base'}`}
          className={cn(
            "w-1.5 rounded-full transition-all duration-1000 ease-out",
            color === "blue" ? "bg-blue-100" : "bg-purple-100",
            i === 4 && (color === "blue" ? "bg-primary" : "bg-purple-600")
          )}
          style={{ height: `${height}%` }}
        />
      );
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Total Voltage Card */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mr-6 shrink-0 border border-blue-100 transition-transform group-hover:scale-110">
          <Zap className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Voltage</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalVoltage}
            </h3>
            <span className="text-lg font-bold text-slate-300 italic">V</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">All real-time voltage</p>
        </div>
        <div
          className="flex items-end space-x-1 h-12 ml-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
          data-purpose="mini-graph"
        >
          {getBars(stats.totalVoltage, 1000, "blue", "voltage")}
        </div>
      </div>

      {/* Total Salinity Card */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center group hover:shadow-md transition-all duration-300">
        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mr-6 shrink-0 border border-purple-100 transition-transform group-hover:scale-110">
          <FlaskConical className="h-7 w-7 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Salinity</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalSalinity}
            </h3>
            <span className="text-sm font-bold text-slate-300 italic uppercase">ppm</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-medium italic">All real-time salinity</p>
        </div>
        <div
          className="flex items-end space-x-1 h-12 ml-4 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
          data-purpose="mini-graph"
        >
          {getBars(stats.totalSalinity, 5000, "purple", "salinity")}
        </div>
      </div>
    </div>
  );
};

export default memo(MonitorStats);
