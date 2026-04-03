import { memo, useMemo } from 'react';
// Changed from METRIC_SCHEMA to METRIC_CONFIG
import { METRIC_CONFIG } from '../../constants';

/**
 * METRIC TOGGLE
 * Uses the UI Configuration layer to render available metric switches.
 */
const MetricToggle = ({ 
  activeMetric, 
  onMetricChange = () => {} 
}) => {
  
  // Guard Clause: Use the new config object
  if (!METRIC_CONFIG) return null;

  // Memoize based on METRIC_CONFIG
  const metrics = useMemo(() => Object.entries(METRIC_CONFIG), []);

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-fit border border-slate-200/50 shadow-inner">
      {metrics.map(([key, config]) => {
        const isActive = activeMetric === key;

        return (
          <button
            key={key}
            onClick={() => onMetricChange(key)}
            aria-pressed={isActive}
            className={`
              flex-1 md:flex-none px-6 py-2 text-xs font-black rounded-xl transition-all duration-300
              flex items-center justify-center gap-2
              ${isActive 
                ? 'bg-white text-slate-900 shadow-md scale-105' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }
            `}
          >
            <span className="text-sm">{config.icon}</span>
            <span className="uppercase tracking-widest leading-none">
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default memo(MetricToggle);