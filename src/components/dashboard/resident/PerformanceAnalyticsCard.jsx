import { memo, useRef } from "react";
import { Calendar, RefreshCw, Activity, Check, ChevronDown, Zap } from "lucide-react";
import { ComposedDeviceChart } from "../../index";

/**
 * PerformanceAnalyticsCard Component
 * Wraps the Device Performance chart with date filtering capabilities.
 */
const PerformanceAnalyticsCard = memo(
  ({
    selectedDate,
    setSelectedDate,
    logsLoading,
    _logs = [],
    performanceChartData,
    deviceIds = [],
  }) => {
    const dateInputRef = useRef(null);
    const hasDevices = deviceIds.length > 0;

    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px] shadow-sm border border-outline-variant/30">
        <div className="flex justify-between items-center mb-6">
          <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase">
            DEVICE PERFORMANCE
          </h5>
          <button
            onClick={() => dateInputRef.current?.showPicker()}
            className="relative flex items-center gap-2 px-3 py-2 border border-outline-variant/30 rounded-lg bg-white shadow-sm hover:bg-surface-container-low transition-all cursor-pointer group/calendar active:scale-95"
          >
            <Calendar className="w-[18px] h-[18px] text-on-surface-variant group-hover/calendar:text-primary transition-colors" />
            <span className="text-label-md text-on-surface font-semibold ml-2 mr-1">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <ChevronDown className="w-[18px] h-[18px] text-on-surface-variant" />
            <input
              ref={dateInputRef}
              type="date"
              className="absolute inset-0 opacity-0 w-full h-full pointer-events-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </button>
        </div>

        <div className="flex-1 relative">
          {logsLoading ? (
            <div className="flex items-center justify-center h-full opacity-30">
              <RefreshCw className="animate-spin w-10 h-10" />
            </div>
          ) : !hasDevices ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 text-center animate-in fade-in duration-500">
              <div className="p-4 rounded-full bg-primary/10 mb-3">
                <Zap size={32} className="text-primary" />
              </div>
              <p className="text-label-md font-bold uppercase tracking-widest text-on-surface-variant">
                Awaiting Assignment
              </p>
              <p className="text-[11px] font-medium text-outline mt-1">
                Check your request status for pending hardware.
              </p>
            </div>
          ) : !performanceChartData || performanceChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 text-center animate-in fade-in duration-500">
              <div className="p-4 rounded-full bg-surface-variant/20 mb-3">
                <Activity size={32} className="text-on-surface-variant" />
              </div>
              <p className="text-label-md font-bold uppercase tracking-widest text-on-surface-variant">
                No data for this date
              </p>
              <p className="text-[11px] font-medium text-outline mt-1">
                History is recorded when devices are active and sending telemetry.
              </p>
            </div>
          ) : (
            <ComposedDeviceChart data={performanceChartData} />
          )}
        </div>

        {/* Stylized Legend mirrored from user-dashboard.html */}
        <div className="flex items-center justify-center gap-6 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary flex items-center justify-center text-white shadow-sm">
              <Check size={10} strokeWidth={4} />
            </div>
            <span className="text-label-sm text-on-surface-variant font-semibold">Voltage (V)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-0.5 bg-primary rounded-full shadow-sm" />
            <span className="text-label-sm text-on-surface-variant font-semibold">Current (A)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1 h-0.5 bg-[#1fd6c1]" />
              <div className="w-1 h-0.5 bg-[#1fd6c1]" />
              <div className="w-1 h-0.5 bg-[#1fd6c1]" />
            </div>
            <span className="text-label-sm text-on-surface-variant font-semibold">
              Salinity (ppt)
            </span>
          </div>
        </div>
      </div>
    );
  }
);

PerformanceAnalyticsCard.displayName = "PerformanceAnalyticsCard";

export default PerformanceAnalyticsCard;
