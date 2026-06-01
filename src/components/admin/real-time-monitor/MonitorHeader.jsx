import { memo } from "react";

/**
 * COMPONENT: MonitorHeader
 * Mirrored from code1.html HeaderSection.
 */
const MonitorHeader = () => {
  return (
    <div
      className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8"
      data-purpose="header"
    >
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
    </div>
  );
};

export default memo(MonitorHeader);
