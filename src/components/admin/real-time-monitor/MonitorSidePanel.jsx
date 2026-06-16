import { memo, useState, useEffect, useMemo } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Bolt,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import { getHistoricalLogs } from "../../../services/reading.service";
import { logger } from "../../../utils/logger";

/**
 * SUB-COMPONENT: InfoItem
 * Cleaner style mirrored from code1.html.
 */
const InfoItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-start space-x-3">
    {Icon && <Icon size={20} className={cn("text-blue-400 shrink-0", color)} />}
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
      <p className={cn("text-sm font-bold leading-tight", color || "text-gray-900")}>{value}</p>
    </div>
  </div>
);

/**
 * SUB-COMPONENT: MiniGraphSection
 * Mirrored from code1.html with tooltip and time labels.
 * Now uses actual historical data points.
 */
const MiniGraphSection = ({ label, value, unit, color, data = [], maxVal = 1000 }) => {
  const [hoverIndex, setHighlightIndex] = useState(data.length - 1);

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {label} ({unit})
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">{value}</span>
          </div>
        </div>
      </div>

      <div className="relative h-32 flex items-end justify-between px-1">
        {/* Tooltip Overlay (Follows hover or last point) */}
        {data.length > 0 && (
          <div 
            className="absolute -top-12 bg-black text-white shadow-lg rounded-lg border-2 border-white p-2 text-center z-10 font-extrabold min-w-[60px] transition-all duration-300"
            style={{ left: `${(hoverIndex / (data.length - 1)) * 90}%` }}
          >
            <p className="text-gray-400 text-[9px] uppercase tracking-wider mb-0.5">
              {new Date(data[hoverIndex]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-white text-xs">{data[hoverIndex]?.val}{unit}</p>
          </div>
        )}

        {data.map((point, i) => {
          const height = Math.max(10, Math.min(100, (point.val / maxVal) * 100));
          const pointKey = point.timestamp ? `${label}-${point.timestamp}` : `${label}-fallback-${i}`;
          
          return (
            <div
              key={pointKey}
              onMouseEnter={() => setHighlightIndex(i)}
              className={cn(
                "w-1.5 rounded-t transition-all duration-700 cursor-pointer",
                i === hoverIndex
                  ? color === "blue"
                    ? "bg-blue-600 h-[90%]"
                    : "bg-purple-600 h-[85%]"
                  : color === "blue"
                    ? "bg-blue-200 hover:bg-blue-400"
                    : "bg-purple-200 hover:bg-purple-400"
              )}
              style={{ height: i === hoverIndex ? undefined : `${height}%` }}
            />
          );
        })}
      </div>

      {/* X-Axis Labels (Approximate) */}
      <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-medium">
        {data.filter((_, i) => i % 2 === 0).map((p, i) => (
          <span key={`label-${p.timestamp || i}`}>{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        ))}
      </div>
    </div>
  );
};

/**
 * SUB-COMPONENT: AlertRow
 */
const AlertRow = ({ icon: Icon, title, desc, time, status }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border",
          status === "success"
            ? "bg-green-50 text-green-500 border-green-100"
            : status === "warning"
              ? "bg-orange-50 text-orange-500 border-orange-100"
              : status === "danger"
                ? "bg-red-50 text-red-500 border-red-100"
                : "bg-gray-50 text-gray-400 border-gray-100"
        )}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900">{title}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <p className="text-[10px] text-gray-400">{time}</p>
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "success"
            ? "bg-green-500"
            : status === "warning"
              ? "bg-orange-500"
              : status === "danger"
                ? "bg-red-500"
                : "bg-gray-300"
        )}
      />
    </div>
  </div>
);

/**
 * COMPONENT: MonitorSidePanel
 * Mirrored from code1.html AnalyticsSidePanel.
 * Now hydrates with actual historical logs.
 */
const MonitorSidePanel = ({ isOpen, onClose, device, activeTab, setActiveTab }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && device?.device_id) {
      // Use set timeout to defer state update and avoid synchronous effect warning
      const timer = setTimeout(() => {
        if (isMounted) setLoadingHistory(true);
      }, 0);

      getHistoricalLogs(device.device_id, 14)
        .then((logs) => {
          if (isMounted) {
            // Convert to ascending for the mini-graphs
            setHistory([...logs].reverse());
          }
        })
        .catch((err) => logger.error("[SidePanel]: History failed", err))
        .finally(() => {
          if (isMounted) setLoadingHistory(false);
        });
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    return () => { isMounted = false; };
  }, [isOpen, device?.device_id]);

  const scrollToSection = (tabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(`section-${tabId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Transform history for graphs
  const voltageData = useMemo(() => 
    history.map(h => ({ val: h.voltage, timestamp: h.__normalizedTs })), 
  [history]);
  
  const tdsData = useMemo(() => 
    history.map(h => ({ val: h.tds, timestamp: h.__normalizedTs })), 
  [history]);

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
                      device.status === "Online"
                        ? "bg-green-50 text-green-600"
                        : device.status === "Warning"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {device.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-500">{device.residentName}</p>
                <p className="text-xs text-gray-400">{device.residentEmail}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 mt-8 border-b border-gray-50">
              {["overview", "readings", "alerts"].map((tab) => (
                <button
                  key={`tab-nav-item-${tab}`}
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
            <div
              id="section-overview"
              className="grid grid-cols-2 gap-y-6 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <InfoItem icon={User} label="Resident Name" value={device.residentName} />
              <InfoItem
                icon={Calendar}
                label="Assigned Date"
                value={
                  device.assignedAt
                    ? new Date(device.assignedAt)
                        .toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        .toUpperCase()
                    : "NOT ASSIGNED"
                }
              />
              <InfoItem icon={Phone} label="Contact Number" value={device.residentPhone || "N/A"} />
              <InfoItem label="Device ID" value={device.device_id} />
              <InfoItem icon={MapPin} label="Address" value={device.residentLocation} />
              <InfoItem
                icon={Bolt}
                label="Power Mode"
                value={device.telemetry?.power_mode || "Active"}
              />
              <InfoItem
                icon={ShieldAlert}
                label="Maintenance"
                value={device.telemetry?.is_maintenance ? "Required" : "Nominal"}
                color={device.telemetry?.is_maintenance ? "text-orange-500" : "text-emerald-500"}
              />
            </div>

            {/* Readings Section */}
            <div
              id="section-readings"
              className="pt-4 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center space-x-2 p-1.5 bg-gray-50/50 rounded-full mb-8 overflow-x-auto whitespace-nowrap border border-gray-100 scrollbar-none">
                {["1HR", "3HR", "6HR", "24HR", "3D", "7D", "1M"].map((range) => (
                  <button
                    key={`range-filter-${range}`}
                    className={cn(
                      "px-5 py-2 text-[11px] font-bold rounded-full transition-all duration-200",
                      range === "1HR"
                        ? "bg-primary text-white shadow-sm hover:bg-blue-700"
                        : "text-primary hover:bg-primary hover:text-white"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className="space-y-10">
                {loadingHistory ? (
                   <div className="h-32 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing History...</p>
                   </div>
                ) : (
                  <>
                    <MiniGraphSection
                      label="Voltage potential"
                      value={`${device.telemetry?.voltage || 0}V`}
                      unit="V"
                      color="blue"
                      data={voltageData}
                      maxVal={250}
                    />
                    <MiniGraphSection
                      label="Ionic Density spectrum"
                      value={`${device.telemetry?.tds || device.telemetry?.tds_ppm || 0} PPM`}
                      unit="PPM"
                      color="purple"
                      data={tdsData}
                      maxVal={1000}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Alerts Section */}
            <div
              id="section-alerts"
              className="pt-4 scroll-mt-[260px] animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">System Alerts</h3>
                <button className="text-[10px] font-bold text-primary hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {/* Dynamically derived alerts based on device state */}
                {device.isOnline ? (
                   <AlertRow
                    icon={CheckCircle2}
                    title="Network Stable"
                    desc="Node is successfully broadcasting telemetry."
                    time="Live"
                    status="success"
                  />
                ) : (
                  <AlertRow
                    icon={WifiOff}
                    title="Node Offline"
                    desc="Telemetry stream interrupted. Check facility internet."
                    time="N/A"
                    status="danger"
                  />
                )}
                
                {(device.telemetry?.tds > 800) && (
                  <AlertRow
                    icon={AlertTriangle}
                    title="High Salinity"
                    desc="Density spectrum exceeding nominal efficiency bounds."
                    time="Recent"
                    status="warning"
                  />
                )}

                {device.telemetry?.is_maintenance && (
                  <AlertRow
                    icon={ShieldAlert}
                    title="Maintenance Flag"
                    desc="Hardware requires immediate manual inspection."
                    time="Live"
                    status="danger"
                  />
                )}

                <AlertRow
                  icon={Bolt}
                  title="System Active"
                  desc={`Power mode currently set to: ${device.telemetry?.power_mode || 'Active'}`}
                  time="Current"
                  status="success"
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
