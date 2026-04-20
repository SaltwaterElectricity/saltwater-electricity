import { Waves, Zap, Activity } from 'lucide-react'; // Gumamit ng Lucide icons para sa pro look
import { cn } from "../../../utils/cn"; // Utility para sa clean class merging

// 1. SUB-COMPONENT: Metric Tile (Atomic Component)
// Sumusunod sa 8pt grid: p-4 (16px), gap-3 (12px), rounded-2xl (16px)
const MetricTile = ({ label, value, unit, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", colorClass)}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-slate-900 leading-none">
        {value} <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </p>
    </div>
  </div>
);

export const UserDeviceLayout = ({ telemetry, deviceName, onViewHistory }) => {
  // 2. LOGIC: Quality Evaluation
  const getStatusConfig = (tds) => {
    if (tds < 300) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50', ping: 'bg-emerald-400' };
    if (tds < 600) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50', ping: 'bg-blue-400' };
    return { label: 'Check Filter', color: 'text-amber-500', bg: 'bg-amber-50', ping: 'bg-amber-400' };
  };

  const status = getStatusConfig(telemetry?.tds || 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER SECTION (8pt: space-y-2 = 8px) */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">
            {deviceName || "Aqua Unit"}
          </h3>
          <div className="flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", status.ping)}></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", status.ping)}></span>
             </span>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Device</p>
          </div>
        </div>
        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", status.bg, status.color)}>
          {status.label}
        </div>
      </div>

      {/* PRIMARY METRIC: Salinity (8pt: py-8 = 64px) */}
      <div className="relative overflow-hidden flex flex-col items-center py-8 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-blue-900/20">
        {/* Decorative Wave Pattern background could go here */}
        <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-3">
          Salinity Level
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter">{telemetry?.tds || '0'}</span>
          <span className="text-sm font-bold text-blue-300 uppercase">ppm</span>
        </div>
      </div>

      {/* SECONDARY METRICS: Voltage & Health (8pt: gap-4 = 16px) */}
      <div className="grid grid-cols-2 gap-4">
        <MetricTile 
          label="Power"
          value={telemetry?.voltage || '--'} 
          unit="V"
          icon={Zap}
          colorClass="bg-amber-100 text-amber-600"
        />
        <MetricTile 
          label="Health"
          value={telemetry?.tds < 800 ? "98" : "72"} 
          unit="%"
          icon={Activity}
          colorClass="bg-blue-100 text-blue-600"
        />
      </div>

      {/* ACTION FOOTER (8pt: h-14 = 56px) */}
      <button 
        onClick={onViewHistory}
        className="group w-full h-14 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Waves size={16} className="group-hover:animate-bounce" />
        VIEW ANALYTICS
      </button>
    </div>
  );
};
