import { memo, useState, useEffect } from "react";
import { X, User, Calendar, MapPin } from "lucide-react";
import { cn } from "../../../utils/cn";
import { DeviceControlSection } from "./DeviceControlSection";
import { HardwareUsageSection } from "./HardwareUsageSection";
import { ReadingsSection } from "./ReadingsSection";
import { AlertHistorySection } from "./AlertHistorySection";

/**
 * DeviceDetailsPanel Component
 * Slide-out drawer for detailed device oversight.
 * Mirrored from code1.html legacy design.
 */
const DeviceDetailsPanel = ({ isOpen, onClose, device, telemetry, assignment, auditLogs = [] }) => {
  const [now, setNow] = useState(0);

  // Update 'now' when panel opens or telemetry updates
  useEffect(() => {
    if (isOpen) {
      // Defer to next tick to avoid cascading render performance warning
      const timer = setTimeout(() => setNow(Date.now()), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, telemetry?.timestamp]);

  if (!device) return null;

  const { device_id, device_name } = device;

  // Requirement: Ensure isOnline is accurate even during the first tick after opening
  const isOnline = now > 0 && telemetry?.timestamp && now - telemetry.timestamp < 300000;

  const firstName = assignment?.firstName || "Unknown";
  const lastName = assignment?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const assignedDate = assignment?.assignedAt
    ? new Date(assignment.assignedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not Assigned";
  const address = assignment?.address?.baranggay || "Location unset";

  return (
    <aside
      className={cn(
        "fixed right-0 top-[65px] h-[calc(100vh-65px)] w-full sm:w-[400px] bg-white border-l border-slate-100 shadow-2xl z-[50] flex flex-col transition-transform duration-500 ease-in-out transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* 1. FIXED HEADER */}
      <header className="p-5 border-b border-slate-50 flex-none bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="relative flex items-start gap-3 mb-4">
          {/* Branding Icon */}
          <div className="flex-none w-12 h-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center overflow-hidden">
            <img
              src="/favicon.png"
              alt="ESM"
              className="w-8 h-8 object-contain opacity-80"
              onError={(e) => {
                e.target.src =
                  "https://ui-avatars.com/api/?name=ESM&background=eff6ff&color=2563eb&bold=true";
              }}
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 pr-8 pt-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                {device_name || device_id}
              </h2>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase border",
                  isOnline
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-600 font-bold text-[12px] leading-tight">{fullName}</p>
              <p className="text-slate-400 text-[10px] font-medium leading-tight truncate">
                {assignment?.email || "Account Connected"}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-1 -right-1 p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Anchor Links */}
        <nav className="flex gap-5 overflow-x-auto no-scrollbar pt-1">
          {["Control", "Readings", "Components", "Alerts"].map((tab) => (
            <a
              key={tab}
              href={`#section-${tab.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors pb-1.5 relative group"
            >
              {tab}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
      </header>

      {/* 2. SCROLLABLE CONTENT */}
      {/* Requirement: Use key={device_id} to force a full reset of sub-components and scroll position when switching devices */}
      <div key={device_id} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-10 pb-20">
        {/* Overview Section */}
        <section id="section-overview" className="scroll-mt-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">
            Overview
          </h3>
          <div className="grid grid-cols-2 gap-y-5 gap-x-3">
            <DetailItem icon={User} label="Household User" value={fullName} />
            <DetailItem icon={Calendar} label="Assigned Date" value={assignedDate} />
            <DetailItem icon={MapPin} label="Address" value={address} fullWidth />
          </div>
        </section>

        {/* Device Control Section */}
        <DeviceControlSection deviceId={device_id} telemetry={telemetry} />

        {/* Readings Section */}
        <ReadingsSection deviceId={device_id} telemetry={telemetry} />

        {/* Hardware Usage Section */}
        <HardwareUsageSection deviceId={device_id} telemetry={telemetry} />

        {/* Alert History Section */}
        <AlertHistorySection deviceId={device_id} auditLogs={auditLogs} />
      </div>
    </aside>
  );
};

const DetailItem = ({ icon: Icon, label, value, fullWidth }) => (
  <div className={cn("flex items-start gap-2.5", fullWidth && "col-span-2")}>
    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100/50">
      <Icon size={14} className="text-primary/60" />
    </div>
    <div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-[12px] font-bold text-slate-700 leading-tight">{value}</p>
    </div>
  </div>
);

export default memo(DeviceDetailsPanel);
