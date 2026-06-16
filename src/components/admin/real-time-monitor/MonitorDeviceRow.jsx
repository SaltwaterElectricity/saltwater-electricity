import { memo, useMemo } from "react";
import { MapPin, Cpu } from "lucide-react";
import { cn } from "../../../utils/cn";
import { formatRelativeTime } from "../../../utils/timeUtils";

/**
 * SUB-COMPONENT: ReadingColumn
 * Visualizes a reading (Voltage/Salinity) with a mini-graph.
 * Now dynamically generates heights based on the value to reflect actual data scale.
 */
const ReadingColumn = ({ label, value, unit, color }) => {
  // Logic to generate pseudo-random but stable bar heights based on the actual value
  // This makes the mini-graph feel "real" and reflective of the current data point.
  const bars = useMemo(() => {
    const numValue = parseFloat(value) || 0;
    // Scale the bars around the current value's "intensity"
    // Voltage ~220 is mid, TDS ~400 is mid.
    const intensity = label === "Voltage" ? (numValue / 250) : (numValue / 1000);
    
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      // Variation: base intensity + some variance
      h: Math.max(10, Math.min(100, (intensity * 60) + (Math.sin(i * 1.5) * 20) + 20))
    }));
  }, [value, label]);

  return (
    <div className="w-40 group/reading">
      <div className="flex flex-col mb-1">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-end space-x-1 h-8">
        {bars.map((bar) => (
          <div
            key={`${label}-${bar.id}`}
            className={cn(
              "flex-1 rounded-sm transition-all duration-700 ease-out",
              color === "blue"
                ? "bg-blue-100 group-hover/reading:bg-primary"
                : "bg-purple-100 group-hover/reading:bg-purple-600"
            )}
            style={{ height: `${bar.h}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * COMPONENT: MonitorDeviceRow
 * Mirrored from code1.html Device List row.
 */
const MonitorDeviceRow = ({ device, onView }) => {
  return (
    <div className="bg-white px-6 py-4 rounded-[24px] border border-gray-100 flex items-center shadow-sm hover:shadow-md transition-shadow group h-[100px]">
      {/* Identity Section */}
      <div className="w-[28%] flex items-center space-x-3 pr-4 border-r border-gray-100 h-full">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6",
            device.isOnline
              ? "bg-blue-50 text-primary border-blue-100"
              : "bg-gray-50 text-gray-400 border-gray-100"
          )}
        >
          <Cpu className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 truncate">{device.device_id}</span>
            <span
              className={cn(
                "px-1.5 py-0.5 text-[9px] font-bold rounded uppercase",
                device.status === "Online"
                  ? "bg-green-50 text-green-600"
                  : device.status === "Warning"
                    ? "bg-orange-50 text-orange-600"
                    : "bg-gray-100 text-gray-500"
              )}
            >
              {device.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{device.residentName}</p>
          <div className="flex items-center mt-0.5 text-[10px] text-gray-400">
            <MapPin className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{device.residentLocation}</span>
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="flex-1 flex items-center px-8 space-x-12">
        <ReadingColumn
          label="Voltage"
          value={device.telemetry?.voltage || 0}
          unit="V"
          color="blue"
        />
        <ReadingColumn
          label="Salinity"
          value={device.telemetry?.tds || device.telemetry?.tds_ppm || 0}
          unit="ppm"
          color="purple"
        />
      </div>

      {/* Action Section */}
      <div className="flex items-center">
        <div className="w-20 flex flex-col items-start">
          <p className="text-[10px] font-bold text-gray-400">
            {formatRelativeTime(device.telemetry?.timestamp)}
          </p>
          <p className="text-[9px] text-gray-300 font-medium">real-time</p>
        </div>
        <button
          onClick={onView}
          className="ml-6 px-5 py-2.5 bg-white border border-primary text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-sm uppercase active:scale-95"
        >
          VIEW
        </button>
      </div>
    </div>
  );
};

export default memo(MonitorDeviceRow);
