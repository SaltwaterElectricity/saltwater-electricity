import { memo, useMemo } from 'react';

/**
 * STAT CARD
 * A lightweight, read-only display for calculated metrics (Min, Max, Trend).
 * Optimized for performance using memoized style lookups.
 */
const StatCard = ({ 
  label = 'Metric', 
  value = 0, 
  unit = '', 
  type = 'default', 
  trendValue = 0 
}) => {
  
  // 1. Performance: Memoize colors so they only recalculate if 'type' or 'trendValue' changes
  const colorStyles = useMemo(() => {
    switch (type) {
      case 'max':   return 'text-rose-500 bg-rose-50';
      case 'min':   return 'text-blue-500 bg-blue-50';
      case 'trend': return trendValue >= 0 
        ? 'text-emerald-500 bg-emerald-50' 
        : 'text-amber-500 bg-amber-50';
      default:      return 'text-slate-600 bg-slate-50';
    }
  }, [type, trendValue]);

  // 2. Safety Check: Handle null/undefined values gracefully to prevent .toFixed() crashes
  const displayValue = useMemo(() => {
    if (value === null || value === undefined) return '--.-';
    if (typeof value === 'number') return value.toFixed(1);
    return value;
  }, [value]);

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-1 transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      
      <div className="flex items-baseline gap-1">
        {/* We use the first class from our memoized string for the text color */}
        <span className={`text-2xl font-black tracking-tight ${colorStyles.split(' ')[0]}`}>
          {displayValue}
        </span>
        
        {unit && (
          <span className="text-xs font-bold text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(StatCard);