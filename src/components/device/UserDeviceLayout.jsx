import { ArrowRight, Maximize2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../constants/routes";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * MetricCard Component
 * High-density data visualization with dynamic progress indicators.
 */
const MetricCard = ({ label, value, unit, type, colorClass }) => {
  const config = SENSOR_CONFIG[type] || {};
  const val = parseFloat(value) || 0;

  // Calculate progress percentage relative to sensor limits
  const min = config.min || 0;
  const max = config.max || 100;
  const progress = Math.min(Math.max(((val - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50 flex flex-col items-center text-center">
      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 font-body-md flex items-center min-h-[14px] justify-center whitespace-nowrap">
        {label}
      </div>

      <div className="mb-3 flex-1 flex flex-col items-center justify-center">
        <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">
          {value ?? "--"}
        </p>
        <p className="text-primary font-black text-[10px] uppercase tracking-[0.2em] mt-1.5 leading-none">
          {unit}
        </p>
      </div>

      {/* Progress Indicator Container */}
      <div className="metric-progress-bar h-1 mt-auto w-full">
        <div
          className={cn("metric-progress-fill", colorClass || "bg-primary")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * ProvisionDeviceCard Component
 * High-fidelity mirror of the 'Request for Another Device' section.
 */
export const ProvisionDeviceCard = ({ onAction }) => {
  return (
    <div
      onClick={onAction}
      className="bg-surface-container-low/50 border-2 border-dashed border-primary/20 rounded-[24px] flex flex-row items-center justify-between gap-4 group cursor-pointer hover:bg-surface-container-low hover:border-primary/40 transition-all p-4 sm:p-6 mb-8 animate-fade-in"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(10,46,255,0.3)] bg-primary group-hover:scale-110 transition-transform duration-500">
          <Plus size={24} strokeWidth={3} />
        </div>
        <div className="text-left flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <h4 className="font-display text-on-surface text-sm sm:text-base font-bold uppercase tracking-tight italic whitespace-nowrap">
            Request for Another Device
          </h4>
          <span className="hidden md:block text-primary/40 font-black text-lg">/</span>
          <p className="font-body-md text-on-surface-variant text-[10px] sm:text-xs whitespace-nowrap opacity-80">
            Add your saltwater electricity devices with just a click.
          </p>
        </div>
      </div>
      <div className="flex-shrink-0 hidden md:block">
        <button className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95">
          Request New Device
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export const UserDeviceLayout = ({
  telemetry,
  deviceName,
  deviceId,
  assignment,
  onViewHistory,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const getStatusConfig = (tds) => {
    const config = SENSOR_CONFIG[METRICS.TDS];
    const val = Number(tds) || 0;

    if (val < config.warning)
      return {
        label: "Active",
        color: "text-green-600",
        bg: "bg-green-50",
        dot: "bg-green-500",
        border: "border-green-100",
      };
    if (val < config.critical)
      return {
        label: "Check",
        color: "text-orange-600",
        bg: "bg-orange-50",
        dot: "bg-orange-500",
        border: "border-orange-100",
      };
    return {
      label: "Critical",
      color: "text-red-600",
      bg: "bg-red-50",
      dot: "bg-red-500",
      border: "border-red-100",
    };
  };

  // 1. NORMALIZED DATA ACCESS: Use pre-formatted service keys with strict zero fallbacks
  const voltage = telemetry?.voltage ?? 0;
  const current = telemetry?.current ?? 0;
  const tds = telemetry?.tds ?? 0;
  const status = getStatusConfig(tds);

  const handleAnalyticsRedirect = () => {
    if (onViewDetails) {
      onViewDetails();
    } else if (onViewHistory) {
      onViewHistory();
    } else {
      const targetPath = ROUTES.DEVICE_ANALYTICS.replace(":deviceId", deviceId);
      navigate(targetPath);
    }
  };

  // 2. TIMING LOGIC: Multi-tier fallback (Latest Sync -> Assignment Date -> Never)
  const displayTimestamp = telemetry?.timestamp || assignment?.timestamp || assignment?.assignedAt;

  const lastSync = displayTimestamp
    ? new Date(displayTimestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      new Date(displayTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never";

  return (
    <div className="bg-cardBg rounded-[24px] shadow-premium p-6 sm:p-8 relative overflow-hidden animate-fade-in flex flex-col h-full border border-white/40">
      <div className="flex items-start justify-between mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2 gap-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight italic font-display truncate">
              {deviceName || "Aqua Unit"}
            </h3>
            <span
              className={cn(
                "flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 shadow-sm",
                status.bg,
                status.color,
                status.border
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status.dot)} />
              <span>{status.label}</span>
            </span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight truncate">
            {lastSync} • Coastal Hub
          </p>
        </div>

        <button
          onClick={handleAnalyticsRedirect}
          className="w-9 h-9 flex items-center justify-center text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shrink-0 ml-4"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Metrics Grid - 3 Columns (Voltage, Total Current, Salinity) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 flex-1">
        <MetricCard
          label="Voltage"
          value={voltage}
          unit="V"
          type={METRICS.VOLTAGE}
          colorClass="bg-primary"
        />
        <MetricCard
          label="Current Total"
          value={current}
          unit="A"
          type={METRICS.CURRENT}
          colorClass="bg-cyan-400"
        />
        <MetricCard
          label="Salinity"
          value={tds}
          unit="PPM"
          type={METRICS.TDS}
          colorClass="bg-teal-400"
        />
      </div>

      {/* Primary Action */}
      <button
        onClick={handleAnalyticsRedirect}
        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[11px] shadow-xl shadow-primary/20 btn-interaction uppercase tracking-widest mt-auto"
      >
        View Details
      </button>
    </div>
  );
};
