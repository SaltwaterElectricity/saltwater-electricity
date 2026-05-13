import { memo } from 'react';
import { TIME_RANGES } from '../../constants';

/**
 * OPTIMIZED TIME RANGE SELECTOR
 * Logic: Stateless component using memoization for high-frequency data environments.
 */
const TimeRangeSelector = ({ 
  currentRange = 24, 
  onRangeChange = () => {} 
}) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200/50">
      {TIME_RANGES.map((range) => {
        const isActive = currentRange === range.value;
        
        return (
          <button
            key={range.value}
            onClick={() => onRangeChange(range.value)}
            // Standard accessibility attribute for toggle/choice buttons
            aria-pressed={isActive}
            className={`
              px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }
            `}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
};

// Use memo to prevent re-renders unless the currentRange prop changes
export default memo(TimeRangeSelector);