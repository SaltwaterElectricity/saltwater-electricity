import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * METRIC GAUGE
 * High-performance display with dynamic "Alert Zones."
 * Updated: Consumes precision and thresholds from SENSOR_CONFIG.
 */
const MetricGauge = ({ 
  label, 
  value, 
  min, 
  max,
  thresholds = {}, // Destructured from SENSOR_CONFIG (warning, critical)
  precision = 1,   // Dynamic precision from SENSOR_CONFIG
  unit = '', 
  icon, 
  pulse = false, 
  isFullWidth = false 
}) => {
  
  // 1. STATUS ENGINE: Maps value to semantic UI states
  const getStatusConfig = () => {
    if (typeof value !== 'number') return {
      container: "border-slate-500/30 bg-slate-500/5 text-slate-400",
      status: "neutral"
    };

    const { warning, critical } = thresholds;

    // Critical Check
    if (critical !== undefined && value >= critical) return {
      container: "border-red-500/40 bg-red-500/10 text-red-500",
      status: "critical"
    };

    // Warning Check
    if (warning !== undefined && value >= warning) return {
      container: "border-amber-500/40 bg-amber-500/10 text-amber-500",
      status: "warning"
    };

    // Safe Zone
    return {
      container: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
      status: "safe"
    };
  };

  const { container, status } = getStatusConfig();

  // 2. HELPER: Formats numbers based on sensor-specific precision
  const formatVal = (val) => (typeof val === 'number' ? val.toFixed(precision) : '--.-');

  return (
    <div className={`
      relative overflow-hidden p-5 rounded-[2rem] border backdrop-blur-md 
      transition-all duration-500 hover:scale-[1.02]
      ${container} 
      ${isFullWidth ? 'w-full' : ''}
    `}>
      
      {/* Alert Ping: Only visible during Critical status */}
      <div className={`
        absolute top-4 left-4 h-1 w-1 rounded-full bg-red-500
        ${status === 'critical' ? 'animate-ping opacity-100' : 'opacity-0'}
      `} />

      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
          {label}
        </span>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-black tracking-tighter">
          {formatVal(value)}
        </span>
        {unit && <span className="text-xs font-bold opacity-50">{unit}</span>}
      </div>

      {/* DAILY EXTREMES (Window Min/Max) */}
      <div className="flex items-center gap-3 pt-3 border-t border-current/10">
        <div className="flex flex-col">
          <span className="text-[7px] uppercase font-bold opacity-40 leading-none mb-1">High</span>
          <span className="text-[11px] font-black tracking-tight leading-none">
            {formatVal(max)}<span className="ml-0.5 opacity-50">{unit}</span>
          </span>
        </div>
        
        <div className="w-px h-6 bg-current/10" />

        <div className="flex flex-col">
          <span className="text-[7px] uppercase font-bold opacity-40 leading-none mb-1">Low</span>
          <span className="text-[11px] font-black tracking-tight leading-none">
            {formatVal(min)}<span className="ml-0.5 opacity-50">{unit}</span>
          </span>
        </div>
      </div>

      {pulse && (
        <div 
          className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
          title="Live Active Stream"
        />
      )}
    </div>
  );
};

MetricGauge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.number,
  max: PropTypes.number,
  precision: PropTypes.number,
  thresholds: PropTypes.shape({
    warning: PropTypes.number,
    critical: PropTypes.number
  }),
  unit: PropTypes.string,
  pulse: PropTypes.bool,
  icon: PropTypes.node,
  isFullWidth: PropTypes.bool
};

export default memo(MetricGauge);