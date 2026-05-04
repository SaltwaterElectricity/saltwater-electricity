import { memo } from "react";

/**
 * InsightPanel Component
 * Displays AI-driven predictive insights.
 * Features a pulse animation and confidence badge.
 */
const InsightPanel = memo(() => {
  return (
    <div className="glass-panel p-md border-secondary-container/30 bg-secondary-container/5 relative overflow-hidden font-['Inter']">
      {/* Pulse Animation Indicator */}
      <div className="absolute top-0 right-0 p-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
      </div>

      <div className="flex items-start space-x-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <span className="material-symbols-outlined text-blue-700">psychology</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-['Space_Grotesk'] text-sm font-bold text-blue-900 uppercase tracking-wider">
              AI Predictive Insight
            </h4>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
              CONFIDENCE: 92%
            </span>
          </div>
          <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">
            Potential filter maintenance required within 48 hours.{" "}
            <span className="text-blue-700 font-bold">78% probability of intake obstruction</span> detected at Station: Batangas South.
          </p>
          <div className="mt-3 flex space-x-3">
            <button className="text-xs font-bold text-blue-700 hover:underline flex items-center transition-all uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm mr-1">schedule</span> Schedule Service
            </button>
            <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InsightPanel;
