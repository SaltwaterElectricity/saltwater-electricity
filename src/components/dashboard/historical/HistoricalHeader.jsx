import { memo } from "react";

/**
 * HistoricalHeader Component
 * Mirrored from legacy design code1.html.
 * Features a relative header with a stylized background illustration.
 */
const HistoricalHeader = ({ onSearch }) => {
  return (
    <header className="relative px-xl pt-lg pb-2xl border-b border-outline-variant overflow-hidden">
      {/* Simplified Vector Background Illustration */}
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
        <img 
          className="w-full h-full object-cover" 
          alt="Power lines illustration"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmg6d6yWpJsjdtvgIuaj2GCcu29_9SJZF8mDqY48wYiJENRhiujBK40Tj0XCAzCzezEftps8BsvIoFr0ww204cIPINT3i4ap4dn07MRkqjDQKg9qJPZv6Sdk6VBGBgbg8w1PbVwn4mM-RMrYSvzRQBwW7GMLwWtkYTbYGXPQFej47yMeBfa3aIB8E-DGMPq6lnST4g-uQ1C60G4Vvrzp1IZgF8Rlj3wwbRYpgtb9gdznykg8LgFAodsRK8X944Zw1ZUPZMOSsI2Kk" 
        />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mt-20">
            <span className="text-on-surface">Historical</span> <span className="text-primary">Data</span>
          </h2>
          <p className="text-body-base text-secondary mt-1">
            View and analyze historical data of saltwater electricity and system performance.
          </p>
        </div>

        <div className="flex items-center gap-md">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
            <input 
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-body-sm focus:ring-2 focus:ring-primary w-64 transition-all" 
              placeholder="Search historical records..." 
              type="text"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default memo(HistoricalHeader);
