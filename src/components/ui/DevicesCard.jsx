import { useState, useEffect } from 'react';

/**
 * DEVICES CARD (The Sidebar Item)
 * Handles both the Single-Click (Active) and Double-Click (Navigation) UI feedback.
 */
const DevicesCard = ({ mac, data, active }) => {
  const { isOnline, lastSeen, displayTDS, displayTemp } = data;
  const [relativeTime, setRelativeTime] = useState('...');

  // Update the relative time string every 10 seconds
  useEffect(() => {
    if (!lastSeen) return;

    const updateRelativeTime = () => {
      const now = Date.now();
      const diffInSecs = Math.floor((now - lastSeen) / 1000);
      
      if (diffInSecs < 15) setRelativeTime('Just now');
      else if (diffInSecs < 60) setRelativeTime(`${diffInSecs}s ago`);
      else if (diffInSecs < 3600) setRelativeTime(`${Math.floor(diffInSecs / 60)}m ago`);
      else setRelativeTime('Stale');
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);

    return () => clearInterval(interval);
  }, [lastSeen]);

  return (
    <div className={`p-5 rounded-[2rem] border transition-all duration-300 shadow-sm group ${
      active 
        ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 scale-[1.02]' 
        : !isOnline 
          ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
          : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
    }`}>
      
      {/* HEADER: MAC & LIVE STATUS */}
      <div className="flex justify-between items-start mb-4">
        <div className="overflow-hidden">
          <h3 className={`font-black text-[10px] truncate uppercase tracking-widest ${
            active ? 'text-blue-600' : !isOnline ? 'text-slate-400' : 'text-slate-900'
          }`}>
            {mac}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
            {isOnline ? 'Active' : 'Last Seen'}: {relativeTime}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Offline
            </span>
          )}
          <div className={`h-2.5 w-2.5 rounded-full ${
            !isOnline ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'
          }`} />
        </div>
      </div>
      
      {/* DATA POINTS GRID */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Salinity</span>
          <span className={`text-sm font-black ${!isOnline ? 'text-slate-400' : 'text-blue-600'}`}>
            {displayTDS} <small className="text-[9px] opacity-60">PPM</small>
          </span>
        </div>

        <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Temp</span>
          <span className={`text-sm font-black ${!isOnline ? 'text-slate-400' : 'text-orange-500'}`}>
            {displayTemp}°C
          </span>
        </div>
      </div>

      {/* FOOTER: UX HINT FOR DOUBLE CLICK */}
      <div className="mt-3 pt-2 border-t border-slate-50 flex justify-center h-5 items-center">
        {active ? (
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] animate-pulse">
            Double Click for History ➔
          </span>
        ) : (
          <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Click to Select
          </span>
        )}
      </div>
    </div>
  );
};

export default DevicesCard;