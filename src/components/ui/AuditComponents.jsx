import { cn } from "../../utils/cn";

export const MiniStat = ({ label, value, unit }) => (
  <div className="p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">
      {value}
      <span className="text-[10px] ml-0.5 text-slate-400 uppercase">{unit}</span>
    </p>
  </div>
);

export const StatusRow = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl hover:bg-white/80 transition-colors">
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-slate-800 leading-none">{value}</p>
    </div>
    <div
      className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
        status === "Stable" || status === "Online" || status === "Active"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600"
      )}
    >
      {status}
    </div>
  </div>
);

export const SectionHeader = ({ title, sub }) => (
  <div className="mb-8">
    <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase leading-none font-display italic">
      {title}
    </h3>
    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 font-body-md">
      {sub}
    </p>
  </div>
);

export const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 px-2 md:px-4 py-3 rounded-xl transition-all duration-300 group font-body-md",
      active
        ? "bg-white text-blue-600 shadow-md shadow-blue-900/5 ring-1 ring-slate-100"
        : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
    )}
  >
    <Icon
      size={18}
      className={cn(active ? "text-blue-600" : "group-hover:scale-110 transition-transform")}
    />
    <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-center md:text-left">
      {label}
    </span>
  </button>
);
