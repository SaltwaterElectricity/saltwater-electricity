import { Bolt } from "lucide-react";
import { BulbToggle, VoltageGauge, SalinityGauge, SectionHeader } from "../../ui";
import { cn } from "../../../utils/cn";

export const ControlSection = ({ deviceId, logs }) => {
  const latestLog = logs[0] || {};
  
  return (
    <div className="flex flex-col gap-8 animate-fadeIn min-w-0">
      <SectionHeader 
        title="DEVICE OVERVIEW AND CONTROL" 
        sub={`Manage active lighting relays and real-time energy flow for ${deviceId}.`} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Primary Control Card: BulbToggle */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-panel p-8 rounded-[20px] shadow-sm relative overflow-hidden h-full flex flex-col justify-center min-h-[320px] border border-white/40 bg-white/70 backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 text-center w-full">
              <div>
                <span className="font-label-sm text-xs text-primary uppercase tracking-widest mb-2 block font-bold">Manual Control</span>
                <h2 className="font-display text-2xl font-bold text-on-background uppercase tracking-tight">DEVICE LIGHT CONTROL {deviceId}</h2>
              </div>
              
              <BulbToggle deviceId={deviceId} />
              
              <p className="text-sm text-slate-500 font-medium italic">Active Override: High-Intensity Navigation Beam</p>
            </div>
          </div>
        </div>

        {/* Secondary Metric Cards */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Energy Draw Card */}
          <div className="glass-panel p-6 rounded-[20px] shadow-sm border border-white/40 bg-white/70 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-on-background">Energy Generate</h3>
                <p className="font-label-sm text-sm text-on-surface-variant uppercase tracking-widest">Real-time load</p>
              </div>
              <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                <Bolt size={20} />
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-4xl font-bold text-primary font-display tracking-tight">4.2</span>
              <span className="text-lg text-on-surface-variant font-medium ml-1">kWh</span>
            </div>
            
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-sky-400 h-full w-3/4 rounded-full" />
            </div>
            
            <div className="mt-4 flex justify-between text-xs font-semibold text-on-surface-variant">
              <span>0% Load</span>
              <span className="text-primary">75% Efficiency</span>
            </div>
          </div>

          {/* Relay Status Card */}
          <div className="glass-panel p-6 rounded-[20px] shadow-sm border border-white/40 bg-white/70 backdrop-blur-xl flex-1">
            <h3 className="font-display text-xl font-bold text-on-background mb-6 uppercase tracking-tight">Relay Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-white/40">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    latestLog.relay_active ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-300"
                  )} />
                  <span className="text-xs font-bold uppercase tracking-tight">BULB {latestLog.relay_active ? 'ON' : 'OFF'}</span>
                </div>
                <span className="text-[10px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full font-display border border-emerald-100">
                  {latestLog.relay_active ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              
              <button className="w-full text-[10px] font-black text-primary hover:text-white px-4 py-3 bg-primary/5 hover:bg-primary transition-all rounded-xl font-display uppercase tracking-[0.2em] border border-primary/10 flex items-center justify-center gap-2 group">
                 HISTORY LOGS
                 <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Technical Details Bento Section */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-[20px] shadow-sm border border-white/40 bg-white/70 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 py-8">
            <VoltageGauge deviceId={deviceId} size={160} />
            <p className="text-sm font-bold text-primary uppercase tracking-widest font-display">DEVICE VOLTAGE</p>
          </div>
          <div className="glass-panel p-6 rounded-[20px] shadow-sm border border-white/40 bg-white/70 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 py-8">
            <SalinityGauge deviceId={deviceId} size={160} />
            <p className="text-sm font-bold text-primary uppercase tracking-widest font-display">SALINITY LEVEL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

