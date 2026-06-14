import { memo } from "react";

/**
 * HistoricalHeader Component
 * Mirrored from legacy design code1.html.
 * Cleaned version: Removed illustration, search, and utility buttons.
 */
const HistoricalHeader = () => {
  return (
    <header className="relative border-outline-variant overflow-hidden bg-white/40 backdrop-blur-sm">
      <div className="relative z-8 py-8">
        <h2 className="font-sora-display text-display-lg text-primary font-black tracking-tighter">
          <span className="text-on-surface">Historical</span> <span className="text-primary">Data</span>
        </h2>
        <p className="text-body-base text-secondary mt-1">
          View and analyze historical data of saltwater electricity and system performance.
        </p>
      </div>
    </header>
  );
};


export default memo(HistoricalHeader);
