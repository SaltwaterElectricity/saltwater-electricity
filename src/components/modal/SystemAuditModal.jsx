import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  History, 
  Table as TableIcon, 
  UserCheck, 
  Zap,
  Download,
  AlertCircle
} from 'lucide-react';
import { cn } from "../../utils/cn";
import { useReadings, useHistory, useAssignmentDetails } from '../../hooks';
import { DeviceAnalyticsChart } from '../../components';
import { METRIC_CONFIG, METRICS } from '../../constants';
import ModalBackdrop from './ModalBackdrop';

/**
 * SystemAuditModal Component
 * A comprehensive deep-dive into device performance and history.
 * Organized into 5 specialized audit sections.
 */
const SystemAuditModal = ({ isOpen, onClose, deviceId, deviceName }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // DATA FETCHING
  const { reading } = useReadings(deviceId);
  const { logs, loading: logsLoading } = useHistory(deviceId);
  const { fullName, address, assignedAt } = useAssignmentDetails(deviceId);

  // ACCESSIBILITY: Keyboard support
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.2)] w-[95vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/40 border-t-white/60 animate-in zoom-in-95 duration-300">
        
        {/* MODAL HEADER */}
        <header className="p-8 flex items-center justify-between border-b border-slate-100 bg-white/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shrink-0">
              <Activity size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic truncate font-['Space_Grotesk']">
                {deviceName || 'System'} <span className="text-blue-600">Audit</span>
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 truncate font-['Inter']">
                Node: {deviceId}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 md:p-3 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl md:rounded-2xl transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* NAVIGATION: Horizontal on Mobile, Sidebar on Desktop */}
          <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 p-8 gap-4 bg-slate-50/50 custom-scrollbar-hide">
            <NavButton 
              active={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              icon={Activity}
              label="Analytics"
            />
            <NavButton 
              active={activeTab === 'connectivity'} 
              onClick={() => setActiveTab('connectivity')}
              icon={Zap}
              label="Health"
            />
            <NavButton 
              active={activeTab === 'telemetry'} 
              onClick={() => setActiveTab('telemetry')}
              icon={TableIcon}
              label="Logs"
            />
            <NavButton 
              active={activeTab === 'accountability'} 
              onClick={() => setActiveTab('accountability')}
              icon={UserCheck}
              label="Deployment"
            />
            <NavButton 
              active={activeTab === 'consumption'} 
              onClick={() => setActiveTab('consumption')}
              icon={History}
              label="Power"
            />

            <div className="md:pt-8 hidden md:block">
                <button className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg active:scale-95 font-['Inter']">
                    <Download size={14} />
                    Export
                </button>
            </div>
          </nav>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white/10 font-['Inter']">
            {activeTab === 'analytics' && <AnalyticsSection logs={logs} loading={logsLoading} />}
            {activeTab === 'connectivity' && <ConnectivitySection reading={reading} logs={logs} />}
            {activeTab === 'telemetry' && <RawTelemetrySection logs={logs} />}
            {activeTab === 'accountability' && <AccountabilitySection name={fullName} address={address} assignedAt={assignedAt} />}
            {activeTab === 'consumption' && <ConsumptionSection logs={logs} />}
          </main>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// --- SUB-COMPONENTS FOR CLEAN ARCHITECTURE ---

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-xl transition-all duration-300 group font-['Inter']",
      active 
        ? "bg-white text-blue-600 shadow-md shadow-blue-900/5 ring-1 ring-slate-100" 
        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
    )}
  >
    <Icon size={18} className={cn(active ? "text-blue-600" : "group-hover:scale-110 transition-transform")} />
    <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-center md:text-left">{label}</span>
  </button>
);

const SectionHeader = ({ title, sub }) => (
    <div className="mb-8">
        <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase leading-none font-['Space_Grotesk']">{title}</h3>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-['Inter']">{sub}</p>
    </div>
);

// 1. ANALYTICS SECTION
const AnalyticsSection = ({ logs }) => {
    const salinityData = logs.map(l => ({ timestamp: l.__normalizedTs, value: l.tds_ppm || 0 }));
    
    return (
        <div className="flex flex-col gap-8 animate-fadeIn">
            <SectionHeader title="Performance Analytics" sub="Time-series monitoring for key metrics" />
            <div className="h-48 md:h-64 bg-slate-50/50 rounded-3xl border border-slate-100 p-6">
                <DeviceAnalyticsChart data={salinityData} metricConfig={METRIC_CONFIG[METRICS.TDS]} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MiniStat label="Current TDS" value={salinityData[0]?.value || '0'} unit="ppm" />
                <MiniStat label="Peak Value" value={Math.max(...salinityData.map(d => d.value), 0).toFixed(0)} unit="ppm" />
                <MiniStat label="Data Points" value={salinityData.length} unit="pts" />
            </div>
        </div>
    );
};

// 2. CONNECTIVITY SECTION
const ConnectivitySection = ({ reading }) => (
    <div className="flex flex-col gap-8 animate-fadeIn">
        <SectionHeader title="Device Health" sub="Connectivity and hardware operational state" />
        <div className="grid grid-cols-1 gap-4">
            <StatusRow label="Power Mode" value={reading?.power_mode || "Real-time"} status="Active" />
            <StatusRow label="System Status" value={reading?.is_maintenance ? "Maintenance" : "Operational"} status={reading?.is_maintenance ? "Warning" : "Stable"} />
            <StatusRow label="Heartbeat" value="Connected" status="Online" />
        </div>
    </div>
);

// 3. RAW TELEMETRY SECTION
const RawTelemetrySection = ({ logs }) => (
    <div className="flex flex-col gap-8 animate-fadeIn">
        <SectionHeader title="Raw Logs" sub="Unfiltered telemetry data audit trail" />
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 font-['Inter']">
                    <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4 text-center">TDS</th>
                        <th className="p-4 text-center">Volt</th>
                        <th className="p-4 text-right">Relay</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-['Inter']">
                    {logs.slice(0, 15).map(log => (
                        <tr key={log.id} className="text-[10px] md:text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <td className="p-4 whitespace-nowrap">{new Date(log.__normalizedTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                            <td className="p-4 text-center font-mono text-blue-600">{log.tds_ppm}</td>
                            <td className="p-4 text-center font-mono text-slate-400">{log.voltage}V</td>
                            <td className="p-4 text-right">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] uppercase tracking-tighter",
                                    log.relay_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                )}>
                                    {log.relay_active ? "ON" : "OFF"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// 4. ACCOUNTABILITY SECTION
const AccountabilitySection = ({ name, address, assignedAt }) => {
    const formatAddress = (addr) => {
        if (!addr) return "Not provided.";
        if (typeof addr === 'string') return addr;
        return `${addr.street || ''}, ${addr.baranggay || ''}, ${addr.cityProvince || ''}`.replace(/^, /, '');
    };

    return (
        <div className="flex flex-col gap-8 animate-fadeIn">
            <SectionHeader title="Deployment Data" sub="Chain of custody and installation metadata" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50/40 rounded-3xl border border-blue-100/50 backdrop-blur-sm">
                    <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Assigned Representative</p>
                    <p className="text-lg md:text-xl font-black text-blue-900">{name || "Awaiting Assignment"}</p>
                    {assignedAt && (
                        <p className="text-[10px] text-blue-600 font-bold mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            Deployed on {new Date(assignedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/50 backdrop-blur-sm">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Location</p>
                    <p className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed">{formatAddress(address)}</p>
                </div>
            </div>
        </div>
  );
};

// 5. CONSUMPTION SECTION
const ConsumptionSection = ({ logs }) => {
    // Basic calculation simulation
    const totalWatts = logs.reduce((acc, curr) => acc + (curr.voltage * (curr.bulb_ma || 0) / 1000), 0);
    const avgUsage = totalWatts / (logs.length || 1);

    return (
        <div className="flex flex-col gap-8 animate-fadeIn">
            <SectionHeader title="Power Audit" sub="Energy usage and efficiency calculations" />
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20 transition-colors duration-700" />
                <Zap className="text-amber-400 mb-6 relative z-10" size={48} />
                <div className="relative z-10 text-center">
                    <p className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums">
                        {avgUsage.toFixed(2)}<span className="text-lg ml-1 text-slate-400">Wh</span>
                    </p>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4">
                        Estimated Efficiency Index
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black text-emerald-900">Normal Range</p>
                </div>
                <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Grid Peak</p>
                    <p className="text-xs font-black text-slate-900">Stable</p>
                </div>
            </div>
        </div>
    );
};

const MiniStat = ({ label, value, unit }) => (
    <div className="p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">{value}<span className="text-[10px] ml-0.5 text-slate-400 uppercase">{unit}</span></p>
    </div>
);

const StatusRow = ({ label, value, status }) => (
    <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl hover:bg-white/80 transition-colors">
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-black text-slate-800 leading-none">{value}</p>
        </div>
        <div className={cn(
            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
            status === 'Stable' || status === 'Online' || status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
        )}>
            {status}
        </div>
    </div>
);

export default SystemAuditModal;
