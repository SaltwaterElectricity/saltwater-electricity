import { Activity, User, Wifi, ExternalLink, MoreVertical } from 'lucide-react';
import { cn } from "../../utils/cn";
import { SalinityGauge, VoltageGauge } from '../ui';

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

export const AdminMonitoringLayout = ({ device, onViewAnalytics }) => {
  const deviceId = device.device_id;

  return (
    <div className="space-y-6 animate-fadeIn">
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

      {/* GAUGE GRID: Using specialized UI components */}
      <div className="grid grid-cols-2 gap-4">
        <SalinityGauge deviceId={deviceId} size={150} />
        <VoltageGauge deviceId={deviceId} size={150} />
      </div>

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
