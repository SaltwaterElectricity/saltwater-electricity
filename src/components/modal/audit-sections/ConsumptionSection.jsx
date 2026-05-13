import { Zap } from "lucide-react";
import { SectionHeader } from "../../ui";

export const ConsumptionSection = ({ logs }) => {
  // Basic calculation simulation
  const totalWatts = logs.reduce(
    (acc, curr) => acc + (curr.voltage * (curr.bulb_ma || 0)) / 1000,
    0
  );
  const avgUsage = totalWatts / (logs.length || 1);

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <SectionHeader title="Power Audit" sub="Energy usage and efficiency calculations" />
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-colors duration-700" />
        <Zap className="text-amber-400 mb-6 relative z-10" size={48} />
        <div className="relative z-10 text-center">
          <p className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums font-display italic">
            {avgUsage.toFixed(2)}
            <span className="text-lg ml-1 text-slate-400">Wh</span>
          </p>
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4 font-body-md">
            Estimated Efficiency Index
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 font-body-md">
            Status
          </p>
          <p className="text-xs font-black text-emerald-900 font-body-md uppercase">Normal Range</p>
        </div>
        <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-body-md">
            Grid Peak
          </p>
          <p className="text-xs font-black text-slate-900 font-body-md uppercase">Stable</p>
        </div>
      </div>
    </div>
  );
};
