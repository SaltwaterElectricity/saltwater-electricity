import appIcon from "../../assets/app-icon.png";
import { memo } from "react";

export const Logo = memo(() => {
  return (
    <div 
      className="flex items-center gap-4 antialiased" 
      role="banner" 
      aria-label="Saltwater Electricity Logo"
    >
      {/* 8pt Grid: 40px Container */}
      <div className="relative group shrink-0">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border border-slate-700/50 transition-colors group-hover:border-blue-500/30">
          <img 
            src={appIcon}
            alt="Saltwater Electricity" 
            className="w-full h-full object-cover p-2" // 8px padding (p-2)
          />
        </div>
        
        {/* Electric Pulse Indicator - 10px (2.5) is acceptable as a micro-element */}
        <div 
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]" 
          aria-hidden="true"
        />
      </div>

      {/* Brand Text Wrapper */}
      <div className="flex flex-col justify-center whitespace-nowrap">
        <div className="flex items-baseline gap-1 font-black text-xl tracking-tighter uppercase italic text-white leading-none">
          Salt<span className="text-blue-500">water</span>
        </div>
        
        {/* 8pt Grid: mt-1 (4px) for tight hierarchy */}
        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.25em] mt-1 drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]">
          Electricity
        </span>
      </div>
    </div>
  );
});