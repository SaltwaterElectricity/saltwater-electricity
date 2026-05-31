import { memo } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Bolt,
} from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * SUB-COMPONENT: InfoItem
 * Cleaner style mirrored from code1.html.
 */
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {Icon && <Icon size={20} className="text-blue-400 shrink-0" />}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

/**
 * SUB-COMPONENT: TimeRangeFilters
 * Button group for selecting time intervals.
 */
const TimeRangeFilters = () => (
  <div className="flex items-center space-x-2 p-1.5 bg-gray-50/50 rounded-full mb-8 overflow-x-auto whitespace-nowrap border border-gray-100 scrollbar-none">
    {["1HR", "3HR", "6HR", "24HR", "3D", "7D", "1M"].map((range, i) => (
      <button
        key={range}
        className={cn(
          "px-5 py-2 text-[11px] font-bold rounded-full transition-all duration-200",
          i === 0 
            ? "bg-primary text-white shadow-sm hover:bg-blue-700" 
            : "text-primary hover:bg-primary hover:text-white"
        )}
      >
        {range}
      </button>
    ))}
  </div>
);

/**
 * SUB-COMPONENT: MiniGraphSection
 * Mirrored from code1.html with tooltip and time labels.
 */
const MiniGraphSection = ({ label, value, unit, color, data }) => (
  <div className="pt-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label} ({unit})</p>
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
    </div>
    
    <div className="relative h-32 flex items-end justify-between px-1">
      {/* Tooltip Overlay */}
      <div className="absolute -top-12 left-[80%] bg-black text-white shadow-lg rounded-lg border-2 border-white p-2 text-center z-10 font-extrabold min-w-[60px]">
        <p className="text-gray-400 text-[11px] uppercase tracking-wider mb-0.5">10:25</p>
        <p className="text-white text-sm">{value}</p>
      </div>

      {data.map((h, i) => (
        <div
          key={`${label}-bar-${i + 1}`}
          className={cn(
            "w-1.5 rounded-t transition-all duration-700",
            i === 6 // Highlight a bar like in code1.html
              ? (color === "blue" ? "bg-blue-600 h-[85%]" : "bg-purple-600 h-[80%]")
              : (color === "blue" ? "bg-blue-400" : "bg-purple-400")
          )}
          style={{ height: i === 6 ? undefined : `${h}%` }}
        />
      ))}
    </div>

    {/* X-Axis Labels */}
    <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-medium">
      {["10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30"].map(t => (
        <span key={t}>{t}</span>
      ))}
    </div>
  </div>
);

/**
 * SUB-COMPONENT: AlertRow
 * Compact style mirrored from code1.html.
 */
const AlertRow = ({ icon: Icon, title, desc, time, status }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border",
        status === "success" ? "bg-green-50 text-green-500 border-green-100" :
        status === "warning" ? "bg-orange-50 text-orange-500 border-orange-100" :
        status === "danger" ? "bg-red-50 text-red-500 border-red-100" :
        "bg-gray-50 text-gray-400 border-gray-100"
      )}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900">{title}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <p className="text-[10px] text-gray-400">{time}</p>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "success" ? "bg-green-500" :
        status === "warning" ? "bg-orange-500" :
        status === "danger" ? "bg-red-500" :
        "bg-gray-300"
      )} />
    </div>
  </div>
);

/**
 * COMPONENT: MonitorSidePanel
 * Mirrored from code1.html AnalyticsSidePanel.
 */
const MonitorSidePanel = ({ isOpen, onClose, device, activeTab, setActiveTab }) => {
  const scrollToSection = (tabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      className={cn(
        "fixed top-[73px] right-0 h-[calc(100vh-73px)] bg-white border-l border-slate-100 overflow-y-auto scrollbar-none transform transition-transform duration-500 ease-out z-[100] shadow-2xl w-[450px]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {device && (
        <div className="h-full flex flex-col min-w-[450px]">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 shadow-sm">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors active:scale-90"
              >
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                <img
                  alt="Saltwater Logo"
                  className="w-10 h-10 object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7JTRQ-V7oco2PJ5O17vmnIkZ8B05Vtsy4LhHSJJhAhyenNdQyZIufqxWfhS8kMpJtvgc_LbDYmyTK4wlYO6QEe6jmGsCYRk76nnpIJoYNn3JBrjrVwGzvWm5m6iS6ByVE6FDFr3EPh3A2OB53vfNroysFiwNFwo_8cZqI3ax61OC4_TCghNpDJpctiwffuCzKJHwFrIaAsGf1cbGgwkaXeoO7Rr3rlx_ixSgJrfLjMomhm7CAnvtZugKlFbYEVHJ5HcT2ia6s0m8"
                />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {device.device_id}
                  </h2>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-black rounded uppercase",
                      device.status === "Online" ? "bg-green-50 text-green-600" :
                      device.status === "Warning" ? "bg-orange-50 text-orange-600" :
                      "bg-gray-100 text-gray-500"
                    )}
                  >
                    {device.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {device.residentName}
                </p>
                <p className="text-xs text-gray-400">
                  {device.residentEmail}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 mt-8 border-b border-gray-50">
              {["overview", "readings", "alerts"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={cn(
                    "pb-3 text-sm font-bold border-b-2 transition-all capitalize",
                    activeTab === tab 
                      ? "text-primary border-primary" 
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content - Single Page Scrollable */}
          <div className="p-6 space-y-8">
            {/* Overview Section */}
            <div id="section-overview" className="grid grid-cols-2 gap-y-6 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InfoItem icon={User} label="Resident Name" value={device.residentName} />
              <InfoItem label="Assigned Date" value="MAY 12, 2025" />
              <InfoItem icon={Phone} label="Contact Number" value={device.residentPhone} />
              <InfoItem label="Device ID" value={device.device_id} />
              <InfoItem icon={MapPin} label="Address" value={device.residentLocation} />
              <InfoItem label="Number of Devices" value="1" />
            </div>

            {/* Readings Section */}
            <div id="section-readings" className="pt-4 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TimeRangeFilters />
              <div className="space-y-10">
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
            </div>

            {/* Alerts Section */}
            <div id="section-alerts" className="pt-4 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Recent Alerts</h3>
                <button className="text-[10px] font-bold text-primary hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <AlertRow
                  icon={CheckCircle2}
                  title="Voltage Stable"
                  desc="Voltage reading is within normal range."
                  time="Just now"
                  status="success"
                />
                <AlertRow
                  icon={AlertTriangle}
                  title="Salinity High"
                  desc="Salinity level is above normal threshold."
                  time="10 mins ago"
                  status="warning"
                />
                <AlertRow
                  icon={WifiOff}
                  title="Device Offline"
                  desc="Device was offline for 5 minutes."
                  time="25 mins ago"
                  status="muted"
                />
                <AlertRow
                  icon={Bolt}
                  title="Voltage Spike Detected"
                  desc="Voltage reached 240V at 09:45 AM."
                  time="1 hour ago"
                  status="danger"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default memo(MonitorSidePanel);
