// Assuming you've set up your index.js in constants folder
import { STATUS_COLORS } from '../../constants';

/**
 * STATS HEADER COMPONENT
 */
const StatsHeader = ({ stats, uiConfig }) => {
  if (!stats || !stats.current) return null;

  const { avg, min, max, trend, latest } = stats.current;
  const unit = uiConfig?.unit || '';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Current" value={latest} unit={unit} color={uiConfig?.color} />
      <StatCard label="Average" value={avg} unit={unit} />
      
      <StatCard 
        label="Peak / Low" 
        value={Number.isFinite(max) && Number.isFinite(min) 
          ? `${max.toFixed(0)} / ${min.toFixed(0)}` 
          : '-- / --'} 
        unit={unit} 
      />

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 leading-none">
          Status
        </p>
        <TrendBadge trend={trend} />
      </div>
    </div>
  );
};

/**
 * REUSABLE STAT CARD
 */
const StatCard = ({ label, value, unit, color }) => {
  const isNumeric = typeof value === 'number' && Number.isFinite(value);
  const displayValue = isNumeric ? value.toFixed(1) : (value || '--');

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 leading-none">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span 
          className="text-xl font-black text-slate-800 tracking-tight transition-colors"
          style={color ? { color } : {}}
        >
          {displayValue}
        </span>
        {unit && <span className="text-[10px] font-bold text-slate-300">{unit}</span>}
      </div>
    </div>
  );
};

/**
 * TREND BADGE
 * Logic: Uses centralized STATUS_COLORS from constants.
 */
const TrendBadge = ({ trend }) => {
  // 1. Stable State
  if (!trend || trend === 0) {
    return (
      <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${STATUS_COLORS.stable}`}>
        STABLE
      </span>
    );
  }
  
  const isPositive = trend > 0;
  
  // 2. Dynamic State Selection
  // Rule: By passing these to the className below, the "never read" warning disappears.
  const colorClass = isPositive ? STATUS_COLORS.up : STATUS_COLORS.down;
  const icon = isPositive ? '▲' : '▼';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-black w-fit ${colorClass}`}>
      <span className="mr-1 text-[10px]">{icon}</span>
      {Math.abs(trend).toFixed(1)}%
    </div>
  );
};

export default StatsHeader;