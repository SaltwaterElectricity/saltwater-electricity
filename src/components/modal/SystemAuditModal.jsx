import { useState, useEffect } from "react";
import {
  X,
  Activity,
  History,
  Table as TableIcon,
  UserCheck,
  Zap,
  Download,
  Settings2,
} from "lucide-react";
import { useReadings, useHistory, useAssignmentDetails } from "../../hooks";
import { NavButton, ModalBackdrop } from "../../components";
import {
  AnalyticsSection,
  ConnectivitySection,
  RawTelemetrySection,
  AccountabilitySection,
  ConsumptionSection,
  ControlSection,
} from "./audit-sections";

/**
 * SystemAuditModal Component
 * A comprehensive deep-dive into device performance and history.
 * Organized into 6 specialized audit and control sections.
 */
const SystemAuditModal = ({ isOpen, onClose, deviceId, deviceName }) => {
  const [activeTab, setActiveTab] = useState("analytics");

  // DATA FETCHING
  const { reading } = useReadings(deviceId);
  const { logs } = useHistory(deviceId);
  const { fullName, address, assignedAt } = useAssignmentDetails(deviceId);

  // ACCESSIBILITY: Keyboard support
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.2)] w-[95vw] max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-white/40 border-t-white/60 animate-in zoom-in-95 duration-300">
        {/* MODAL HEADER */}
        <header className="p-8 flex items-center justify-between border-b border-slate-100 bg-white/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shrink-0">
              <Activity size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic truncate font-display">
                {deviceName || "System"} <span className="text-primary">Audit</span>
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 truncate font-body-md">
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
          <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-8 gap-3 md:gap-4 bg-slate-50/50 custom-scrollbar-hide md:min-w-[240px]">
            <div className="flex md:flex-col gap-3 md:gap-4 flex-nowrap">
              <NavButton
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
                icon={Activity}
                label="Analytics"
              />
              <NavButton
                active={activeTab === "control"}
                onClick={() => setActiveTab("control")}
                icon={Settings2}
                label="Control"
              />
              <NavButton
                active={activeTab === "connectivity"}
                onClick={() => setActiveTab("connectivity")}
                icon={Zap}
                label="Health"
              />
              <NavButton
                active={activeTab === "telemetry"}
                onClick={() => setActiveTab("telemetry")}
                icon={TableIcon}
                label="Logs"
              />
              <NavButton
                active={activeTab === "accountability"}
                onClick={() => setActiveTab("accountability")}
                icon={UserCheck}
                label="Deployment"
              />
              <NavButton
                active={activeTab === "consumption"}
                onClick={() => setActiveTab("consumption")}
                icon={History}
                label="Power"
              />
            </div>

            <div className="md:pt-8 hidden md:block">
              <button className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-lg active:scale-95 font-body-md">
                <Download size={14} />
                Export
              </button>
            </div>
          </nav>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar bg-white/10 font-body-md">
            {activeTab === "analytics" && <AnalyticsSection logs={logs} />}
            {activeTab === "control" && <ControlSection deviceId={deviceId} logs={logs} />}
            {activeTab === "connectivity" && <ConnectivitySection reading={reading} />}
            {activeTab === "telemetry" && <RawTelemetrySection logs={logs} />}
            {activeTab === "accountability" && (
              <AccountabilitySection name={fullName} address={address} assignedAt={assignedAt} />
            )}
            {activeTab === "consumption" && <ConsumptionSection logs={logs} />}
          </main>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default SystemAuditModal;
