import { memo } from "react";
import { MapPin, Server } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * SUB-COMPONENT: ReadingColumn
 * Visualizes a reading (Voltage/Salinity) with a mini-graph.
 */
const ReadingColumn = ({ label, value, unit, color }) => (
  <div className="w-40 group/reading">
    <div className="flex flex-col mb-2">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-baseline space-x-1">
        <span className="text-sm font-bold text-slate-900 group-hover/reading:text-primary transition-colors">
          {value}
          {unit}
        </span>
      </div>
    </div>
    <div className="flex items-end space-x-1 h-8">
      {[
        { id: 1, h: 3 },
        { id: 2, h: 5 },
        { id: 3, h: 8 },
        { id: 4, h: 7 },
        { id: 5, h: 6 },
        { id: 6, h: 4 },
      ].map((bar) => (
        <div
          key={`${label}-${bar.id}`}
          className={cn(
            "flex-1 rounded-sm transition-all duration-500",
            color === "blue"
              ? "bg-blue-100 group-hover/reading:bg-primary"
              : "bg-purple-100 group-hover/reading:bg-purple-600"
          )}
          style={{ height: `${bar.h * 4}px` }}
        />
      ))}
    </div>
  </div>
);

/**
 * COMPONENT: MonitorDeviceRow
 * Mirrored from code1.html Device List row.
 */
const MonitorDeviceRow = ({ device, onView }) => {
  return (
    <div className="bg-white px-6 py-4 rounded-[20px] border border-gray-100 flex items-center shadow-sm hover:shadow-md transition-all duration-300 group h-[110px]">
      {/* Identity Section */}
      <div className="w-[30%] flex items-center space-x-4 pr-6 border-r border-gray-100 h-full">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 shadow-inner",
            device.isOnline
              ? "bg-blue-50 text-primary border-blue-100"
              : "bg-slate-50 text-slate-300 border-slate-100"
          )}
        >
          <Server className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-0.5">
            <span className="font-bold text-slate-900 truncate tracking-tight">
              {device.device_id}
            </span>
            <span
              className={cn(
                "px-1.5 py-0.5 text-[9px] font-bold rounded uppercase shadow-sm border",
                device.status === "Online"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : device.status === "Warning"
                    ? "bg-orange-50 text-orange-600 border-orange-100"
                    : "bg-slate-50 text-slate-400 border-slate-200"
              )}
            >
              {device.status}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 truncate italic">
            {device.residentName}
          </p>
          <div className="flex items-center mt-1 text-[10px] text-slate-400 font-medium">
            <MapPin className="h-3 w-3 mr-1 shrink-0 text-primary opacity-50" />
            <span className="truncate">{device.residentLocation}</span>
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="flex-1 flex items-center px-10 space-x-12">
        <ReadingColumn
          label="Voltage"
          value={device.telemetry?.voltage || 0}
          unit="V"
          color="blue"
        />
        <ReadingColumn
          label="Salinity"
          value={device.telemetry?.tds_ppm || 0}
          unit="ppm"
          color="purple"
        />
      </div>

      {/* Action Section */}
      <div className="flex items-center space-x-6 pl-6 border-l border-gray-100 h-full">
        <div className="flex flex-col items-start min-w-[60px]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Updated</p>
          <p className="text-[10px] font-black text-slate-900 italic">2m ago</p>
        </div>
        <button
          onClick={onView}
          className="px-6 py-2.5 bg-white border border-primary text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-sm uppercase active:scale-95"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default memo(MonitorDeviceRow);
