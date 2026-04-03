/**
 * LoadingScreen
 * Full-screen blocking UI shown during initial app boot or heavy data fetching.
 */
export const LoadingScreen = () => (
  <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center">
    <div className="relative">
      {/* Outer Pulse - Purely aesthetic background effect */}
      <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
      
      {/* Main Spinner - Core progress indicator */}
      <div className="relative w-20 h-20 border-[6px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
    
    <div className="mt-10 text-center animate-pulse">
      <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Initializing Core</h2>
      <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] mt-2">Syncing with Node Network...</p>
    </div>
  </div>
);

/**
 * ReconnectingOverlay
 * A non-blocking toast notification that appears when the database connection drops.
 */
export const ReconnectingOverlay = () => {
  // Staggered animation delays for the "wave" effect
  const delays = [-0.3, -0.15, 0];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
        
        {/* Staggered Bouncing Dots (DRY implementation) */}
        <div className="flex gap-1">
          {delays.map((delay) => (
            <span 
              key={delay}
              style={{ animationDelay: `${delay}s` }}
              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" 
            />
          ))}
        </div>
        
        <div className="flex flex-col">
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Signal Interrupted</span>
          <span className="text-slate-400 text-[9px] font-bold">Attempting to re-establish uplink...</span>
        </div>
      </div>
    </div>
  );
};