import { Activity, ShieldAlert, User, Wifi, ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from "../../../utils/cn";

// 1. SUB-COMPONENT: Admin Info Tag (Atomic)
const InfoTag = ({ label, value, icon: Icon, align = "left" }) => (
  <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
      <Icon size={14} />
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
      <p className="text-[11px] font-black text-slate-700 leading-none">{value}</p>
    </div>
  </div>
);

export const AdminMonitoringLayout = ({ device, telemetry, onViewAnalytics }) => {
  // 2. QA LOGIC: Alert thresholds for Admin
  const tdsValue = telemetry?.tds || 0;
  const isAlert = tdsValue > 500;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER: Identification & QA Status (8pt: space-y-2 = 8px) */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Live</p>
          </div>
          <h3 className="text-lg font-black text-slate-900 truncate max-w-[180px]">
            {device.device_name}
          </h3>
        </div>
        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* QA MONITORING GRID (8pt: gap-3 = 12px) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Salinity QA Card - Highlighted for Admin Attention */}
        <div className={cn(
          "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between h-28",
          isAlert ? "bg-red-50 border-red-100 shadow-sm" : "bg-white border-slate-100"
        )}>
          <div>
            <p className={cn("text-[9px] font-black uppercase tracking-wider", isAlert ? "text-red-400" : "text-slate-400")}>
              Salinity (QA)
            </p>
            <h4 className={cn("text-2xl font-black mt-1", isAlert ? "text-red-600" : "text-slate-900")}>
              {tdsValue}<span className="text-xs ml-0.5">ppm</span>
            </h4>
          </div>
          <div className={cn("flex items-center gap-1 text-[8px] font-bold uppercase tracking-tight", isAlert ? "text-red-500" : "text-emerald-500")}>
            {isAlert ? <ShieldAlert size={10} /> : "✓"} 
            {isAlert ? "Critical Alert" : "Parameter Stable"}
          </div>
        </div>

        {/* Voltage/Power Health */}
        <div className="p-4 rounded-2xl border-2 border-slate-100 bg-white flex flex-col justify-between h-28">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Node Power</p>
            <h4 className="text-2xl font-black text-slate-900 mt-1">
              {telemetry?.voltage || '0'}<span className="text-xs ml-0.5">V</span>
            </h4>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-slate-900 h-full transition-all" 
              style={{ width: `${(telemetry?.voltage / 4.2) * 100}%` }} 
            />
          </div>
        </div>
      </div>

      {/* ACCOUNTABILITY & NETWORK (8pt: px-1 = 4px) */}
      <div className="flex items-center justify-between px-1 py-2 border-y border-slate-50">
        <InfoTag 
          label="Assigned To" 
          value={device.assigned_user_name || "Unassigned"} 
          icon={User} 
        />
        <InfoTag 
          label="ESP32 Heartbeat" 
          value="Active 30s ago" 
          icon={Wifi} 
          align="right" 
        />
      </div>

      {/* ADMIN ACTION: View Analytics */}
      <button 
        onClick={onViewAnalytics}
        className="group w-full h-12 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-blue-600 flex items-center justify-center gap-2"
      >
        <Activity size={14} />
        Full System Audit
        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
