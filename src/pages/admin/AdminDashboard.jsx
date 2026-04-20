import { Users, Activity, Battery, AlertTriangle, Search } from 'lucide-react';
import { cn } from "../../utils/cn";

// Commented out since we are using a temporary mock below
// import { StatCard } from "../../components/dashboard/StatCard"; 

/** * TEMPORARY MOCK STATCARD 
 * Sinusunod nito ang iyong 8-point grid architecture (p-6, rounded-3xl)
 */
const MockStatCard = ({ title, value, unit, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-2xl", colorClass)}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <div className="flex items-baseline gap-1">
        <h2 className="text-2xl font-black text-slate-900">{value}</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 antialiased text-slate-900">
      
      {/* 1. ADMIN HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-black uppercase tracking-tighter text-blue-600">
            System <span className="text-slate-900">Administrator</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Smart Aqua • Network Management
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Unit or Resident..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64 transition-all"
          />
        </div>
      </header>

      {/* 2. SYSTEM OVERVIEW (Using MockStatCard) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MockStatCard title="Total Active Units" value="24" unit="Nodes" icon={Activity} colorClass="bg-blue-50 text-blue-600" />
        <MockStatCard title="System Average PPT" value="0.42" unit="PPT" icon={Users} colorClass="bg-emerald-50 text-emerald-600" />
        <MockStatCard title="Low Battery Alerts" value="03" unit="Units" icon={Battery} colorClass="bg-amber-50 text-amber-600" />
        <MockStatCard title="Offline Devices" value="01" unit="Node" icon={AlertTriangle} colorClass="bg-red-50 text-red-600" />
      </section>

      {/* 3. DEVICE MANAGEMENT TABLE */}
      <main className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Device Fleet Status</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Unit ID</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Resident</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Salinity</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Voltage</th>
                <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <DeviceRow id="402" name="Juno D." ppt="0.45" volt="4.18" status="Online" />
              <DeviceRow id="105" name="Rommel S." ppt="0.38" volt="3.20" status="Low Bat" />
              <DeviceRow id="301" name="Sir RM" ppt="0.41" volt="0.00" status="Offline" />
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const DeviceRow = ({ id, name, ppt, volt, status }) => (
  <tr className="hover:bg-slate-50/50 transition-colors cursor-default">
    <td className="px-8 py-6 text-[11px] font-black text-slate-900 uppercase">Unit {id}</td>
    <td className="px-8 py-6 text-[11px] font-bold text-slate-600">{name}</td>
    <td className="px-8 py-6 text-[11px] font-black text-blue-600">{ppt} PPT</td>
    <td className="px-8 py-6 text-[11px] font-bold text-slate-500">{volt}V</td>
    <td className="px-8 py-6">
      <span className={cn(
        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
        status === "Online" ? "bg-emerald-100 text-emerald-600" : 
        status === "Low Bat" ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
      )}>
        {status}
      </span>
    </td>
  </tr>
);

export default AdminDashboard;