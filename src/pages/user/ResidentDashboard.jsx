import { useState } from 'react';
import { 
  Zap, 
  Bell, 
  History, 
  Lightbulb, 
  Activity,
  Waves,
  ShieldCheck
} from 'lucide-react';
import { cn } from "../../utils/cn"; 

// 1. REUSABLE ATOMIC COMPONENT
const StatCard = ({ title, value, unit, icon: Icon, colorClass, children, isPrimary }) => (
  <div className={cn(
    "p-6 rounded-[32px] border transition-all duration-500",
    isPrimary ? "bg-blue-600 border-transparent text-white shadow-xl shadow-blue-900/20" : "bg-white border-slate-200 shadow-sm text-slate-900"
  )}>
    <div className="flex justify-between items-start">
      <div>
        <p className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          isPrimary ? "text-blue-100" : "text-slate-400"
        )}>
          {title}
        </p>
        <h2 className="text-3xl font-black mt-2">
          {value} <span className={cn("text-sm font-medium", isPrimary ? "opacity-60" : "text-slate-400")}>{unit}</span>
        </h2>
      </div>
      <div className={cn("p-2 rounded-xl", colorClass)}>
        <Icon size={18} />
      </div>
    </div>
    {children}
  </div>
);

const ResidentDashboard = () => {
  const [isBulbOn, setIsBulbOn] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 antialiased text-slate-900">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black uppercase tracking-tighter">
            Smart <span className="text-blue-600">Aqua</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Resident Portal • Unit 402
          </p>
        </div>
        <button className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* PRIMARY METRICS GRID (Using Refactored StatCard) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Salinity - Primary Card */}
        <StatCard 
          title="Water Salinity" 
          value="0.45" 
          unit="PPT" 
          icon={Waves} 
          isPrimary={true}
          colorClass="bg-white/10 text-white"
        >
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full text-white">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Live Data
          </div>
        </StatCard>

        {/* Voltage Card */}
        <StatCard 
          title="Node Voltage" 
          value="4.18" 
          unit="V" 
          icon={Zap} 
          colorClass="bg-amber-50 text-amber-500"
        >
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[88%] transition-all duration-1000"></div>
          </div>
        </StatCard>

        {/* System Health Card */}
        <StatCard 
          title="System Health" 
          value="Optimal" 
          unit="" 
          icon={ShieldCheck} 
          colorClass="bg-emerald-50 text-emerald-500"
        >
          <p className="text-[9px] font-bold text-emerald-500 uppercase mt-2">Stability: 98%</p>
        </StatCard>

        {/* Bulb Control Card (Using StatCard as a Wrapper) */}
        <StatCard 
          title="Bulb Control" 
          value={isBulbOn ? "Active" : "Inactive"} 
          unit="" 
          icon={Lightbulb} 
          colorClass={isBulbOn ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-400"}
        >
          <div className="flex items-center justify-between mt-4">
             <span className="text-[9px] font-bold text-slate-400 uppercase">Toggle Switch</span>
             <button 
              onClick={() => setIsBulbOn(!isBulbOn)}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                isBulbOn ? "bg-yellow-400" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300",
                isBulbOn ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>
        </StatCard>
      </section>

      {/* ANALYSIS & LOGS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Salinity History</h3>
            <div className="flex gap-2">
              <button className="text-[9px] font-black px-4 py-2 bg-slate-100 rounded-xl uppercase">Daily</button>
              <button className="text-[9px] font-black px-4 py-2 text-slate-400 uppercase hover:bg-slate-50 rounded-xl">Weekly</button>
            </div>
          </div>
          <div className="h-[280px] w-full bg-slate-50 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
            <Activity className="text-slate-200" size={32} />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Real-time Analytics Ready</p>
          </div>
        </main>

        <aside className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
            <History size={14} className="text-blue-600" /> Event Logs
          </h3>
          <div className="space-y-6">
            <LogItem title="Light Switched On" desc="Unit 402 light activated via portal." time="Just now" />
            <LogItem title="Voltage Drop" desc="System switched to secondary salt-cell." time="1h ago" />
            <LogItem title="Salinity Peak" desc="0.48 PPT detected during flush." time="3h ago" />
          </div>
        </aside>
      </div>
    </div>
  );
};

const LogItem = ({ title, desc, time }) => (
  <div className="border-l-2 border-slate-100 pl-4 py-1 hover:border-blue-200 transition-colors cursor-default">
    <div className="flex justify-between items-start mb-1">
      <h4 className="text-[10px] font-black text-slate-800 uppercase">{title}</h4>
      <span className="text-[9px] font-bold text-slate-400">{time}</span>
    </div>
    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default ResidentDashboard;