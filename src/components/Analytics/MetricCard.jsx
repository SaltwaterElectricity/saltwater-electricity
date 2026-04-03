import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { APP_SETTINGS } from '../../constants';

/**
 * Helper: Formats the difference between now and timestamp.
 * Pure function kept outside for testability and performance.
 */
const formatTimeAgo = (diffInMs) => {
  const seconds = Math.floor(diffInMs / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
};

const MetricCard = ({ 
  label, 
  value, 
  unit, 
  icon, 
  colorClass, 
  loading, 
  timestamp 
}) => {
  const [isStale, setIsStale] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!timestamp || loading) return;

    const tick = () => {
      const diff = Date.now() - timestamp;
      // Using global constant for stale threshold
      setIsStale(diff > APP_SETTINGS.STALE_THRESHOLD);
      setTimeAgo(formatTimeAgo(diff));
    };

    tick();
    const interval = setInterval(tick, 10000); // 10s is enough for "m ago" updates

    return () => clearInterval(interval);
  }, [timestamp, loading]);

  // Derived styles: Keeps JSX clean and readable
  const stateStyles = {
    container: isStale ? 'opacity-60 grayscale bg-slate-50' : 'opacity-100 bg-white',
    text: isStale ? 'text-slate-400' : colorClass,
    iconContainer: isStale ? 'bg-slate-200' : 'bg-slate-50'
  };

  return (
    <div className={`p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-700 ${stateStyles.container}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {label}
          </p>
          {isStale ? (
            <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black animate-pulse">
              OFFLINE
            </span>
          ) : (
            <span className="text-[10px] text-slate-300 font-bold italic">
              {timeAgo}
            </span>
          )}
        </div>
        
        <h3 className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${stateStyles.text}`}>
          {loading ? (
            <span className="animate-pulse opacity-20">--.-</span>
          ) : (
            Number(value ?? 0).toFixed(1)
          )}
          <span className="text-lg ml-1 text-slate-400 font-medium tracking-normal">
            {unit}
          </span>
        </h3>
      </div>

      <div className={`h-14 w-14 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner transition-all ${stateStyles.iconContainer}`}>
        {isStale ? '🔌' : icon}
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  unit: PropTypes.string.isRequired,
  icon: PropTypes.node,
  colorClass: PropTypes.string,
  loading: PropTypes.bool,
  timestamp: PropTypes.number,
};

export default memo(MetricCard);