import { memo } from "react";
import {
  X,
  User,
  Calendar,
  Phone,
  Server,
  MapPin,
  Activity,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Bolt,
} from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * SUB-COMPONENT: InfoItem
 */
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-4">
    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/5">
      <Icon size={18} className="text-primary" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

/**
 * SUB-COMPONENT: MiniGraphSection
 */
const MiniGraphSection = ({ label, value, unit, color, data }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label} ({unit})
        </p>
        <span className="text-xl font-bold text-slate-900">{value}</span>
      </div>
    </div>
    <div className="relative h-24 flex items-end justify-between px-2 bg-slate-50 rounded-2xl p-4 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
      {data.map((h, i) => (
        <div
          key={`${label}-bar-${i + 1}`}
          className={cn(
            "w-1.5 rounded-t-full transition-all duration-700",
            color === "blue"
              ? "bg-primary/40 hover:bg-primary"
              : "bg-purple-400 hover:bg-purple-600"
          )}
          style={{ height: `${h}%` }}
        />
      ))}
      <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-tighter">
          Live Pulse
        </div>
      </div>
    </div>
  </div>
);

/**
 * SUB-COMPONENT: AlertRow
 */
const AlertRow = ({ icon: Icon, title, desc, time, status }) => (
  <div className="flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border",
          status === "success"
            ? "bg-green-50 text-green-500 border-green-100"
            : status === "warning"
              ? "bg-orange-50 text-orange-500 border-orange-100"
              : "bg-slate-50 text-slate-400 border-slate-100"
        )}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[13px] font-bold text-slate-900 leading-tight mb-1">{title}</p>
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{time}</p>
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full ml-auto mt-2",
          status === "success"
            ? "bg-green-500"
            : status === "warning"
              ? "bg-orange-500"
              : "bg-slate-300"
        )}
      />
    </div>
  </div>
);

/**
 * COMPONENT: MonitorSidePanel
 * Mirrored from code1.html AnalyticsSidePanel.
 */
const MonitorSidePanel = ({ isOpen, onClose, device, activeTab, setActiveTab }) => {
  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full bg-white border-l border-slate-100 overflow-y-auto transform transition-all duration-500 ease-out z-[100] shadow-2xl",
        isOpen ? "translate-x-0 w-[450px]" : "translate-x-full w-0"
      )}
    >
      {device && (
        <div className="h-full flex flex-col min-w-[450px]">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 p-8 border-b border-slate-50">
            <div className="flex justify-end mb-6">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors border border-slate-100 shadow-sm active:scale-90"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner overflow-hidden">
                <img
                  alt="Saltwater Logo"
                  className="w-10 h-10 object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7JTRQ-V7oco2PJ5O17vmnIkZ8B05Vtsy4LhHSJJhAhyenNdQyZIufqxWfhS8kMpJtvgc_LbDYmyTK4wlYO6QEe6jmGsCYRk76nnpIJoYNn3JBrjrVwGzvWm5m6iS6ByVE6FDFr3EPh3A2OB53vfNroysFiwNFwo_8cZqI3ax61OC4_TCghNpDJpctiwffuCzKJHwFrIaAsGf1cbGgwkaXeoO7Rr3rlx_ixSgJrfLjMomhm7CAnvtZugKlFbYEVHJ5HcT2ia6s0m8"
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {device.device_id}
                  </h2>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border shadow-sm",
                      device.status === "Online"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : device.status === "Warning"
                          ? "bg-orange-50 text-orange-600 border-orange-100"
                          : "bg-slate-50 text-slate-400 border-slate-100"
                    )}
                  >
                    {device.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-500 italic mt-1">
                  {device.residentName}
                </p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {device.residentEmail}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mt-10 border-b border-slate-50">
              {["overview", "readings", "alerts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-4 text-[11px] font-bold uppercase tracking-widest transition-all relative",
                    activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-8 space-y-10">
            {activeTab === "overview" && (
              <div className="grid grid-cols-2 gap-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <InfoItem icon={User} label="Resident Profile" value={device.residentName} />
                <InfoItem icon={Calendar} label="Link established" value="MAY 12, 2025" />
                <InfoItem icon={Phone} label="Emergency Contact" value={device.residentPhone} />
                <InfoItem icon={Server} label="Unique Hardware ID" value={device.device_id} />
                <InfoItem icon={MapPin} label="Geographic Sector" value={device.residentLocation} />
                <InfoItem icon={Activity} label="Operational Phase" value={device.status} />
              </div>
            )}

            {activeTab === "readings" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MiniGraphSection
                  label="Voltage potential"
                  value={`${device.telemetry?.voltage || 0}V`}
                  unit="V"
                  color="blue"
                  data={[40, 65, 55, 70, 60, 62, 85, 60, 78, 82, 75, 58, 60]}
                />
                <MiniGraphSection
                  label="Ionic Density spectrum"
                  value={`${device.telemetry?.tds_ppm || 0} PPM`}
                  unit="PPM"
                  color="purple"
                  data={[45, 55, 50, 60, 52, 55, 70, 58, 62, 68, 60, 65, 55]}
                />
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Node Incident Logs
                  </h3>
                  <button className="text-[10px] font-bold text-primary hover:underline">
                    View Archive
                  </button>
                </div>
                <AlertRow
                  icon={CheckCircle2}
                  title="Voltage Stabilization"
                  desc="Telemetry reported return to nominal voltage spectrum."
                  time="Just Now"
                  status="success"
                />
                <AlertRow
                  icon={AlertTriangle}
                  title="High Load"
                  desc="Ion concentration threshold breach detected."
                  time="10m ago"
                  status="warning"
                />
                <AlertRow
                  icon={WifiOff}
                  title="Signal Interrupted"
                  desc="Temporary telemetry blackout reported."
                  time="25m ago"
                  status="muted"
                />
                <AlertRow
                  icon={Bolt}
                  title="Primary Cell Reset"
                  desc="Hardware initiated automated cell membrane restart."
                  time="1h ago"
                  status="muted"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default memo(MonitorSidePanel);
