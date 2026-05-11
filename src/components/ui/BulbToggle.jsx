import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { useReadings } from '../../hooks';
import { updateBulbState } from '../../services/reading.service';
import { cn } from '../../utils/cn';
import { logger } from '../../utils/logger';

/**
 * BulbToggle Component
 * Interactive toggle for IoT bulb control.
 * Adheres to Glassmorphism and 8pt grid system.
 */
const BulbToggle = ({ deviceId }) => {
  const { reading, loading } = useReadings(deviceId);
  const [isToggling, setIsToggling] = useState(false);

  // LOGIC: State is determined by relay_active status
  const isON = !!reading?.relay_active;

  const handleToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      // Toggle logic: If currently ON, turn OFF; else turn ON
      await updateBulbState(deviceId, !isON);
    } catch (error) {
      logger.error("[BulbToggle] Failed to toggle:", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="w-32 h-14 bg-slate-100/50 animate-pulse rounded-2xl" />
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/30 shadow-xl transition-all hover:bg-white/30">
      {/* Icon with Dynamic Glow */}
      <div className={cn(
        "p-2 rounded-xl transition-all duration-500",
        isON ? "bg-amber-400/20 text-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "bg-slate-100/50 text-slate-400"
      )}>
        <Lightbulb 
          size={20} 
          className={cn("transition-transform duration-500", isON && "animate-pulse")} 
        />
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">
          Bulb Control
        </span>
        <span className="text-xs font-bold text-slate-900 leading-none">
          {isON ? "Active" : "Disabled"}
        </span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={cn(
          "relative w-14 h-8 rounded-full transition-colors duration-500 focus:outline-none",
          isON ? "bg-blue-600" : "bg-slate-300",
          isToggling && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
          isON ? "translate-x-6" : "translate-x-0"
        )} />
      </button>
    </div>
  );
};

export default BulbToggle;
