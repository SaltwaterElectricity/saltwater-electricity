import { memo, useState, useEffect, useRef } from "react";
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
  const [activeSection, setActiveSection] = useState("control");
  const scrollContainerRef = useRef(null);

  // Update 'now' when panel opens or telemetry updates
  useEffect(() => {
    if (isOpen) {
      // Defer to next tick to avoid cascading render performance warning
      const timer = setTimeout(() => setNow(Date.now()), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, telemetry?.timestamp]);

  // Handle active section detection on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const sections = ["control", "readings", "components", "alerts"];
      let current = activeSection;

      for (const id of sections) {
        const element = document.getElementById(`section-${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Use a threshold (e.g., top of element is near top of panel)
          if (rect.top <= 200) {
            current = id;
          }
        }
      }
      if (current !== activeSection) setActiveSection(current);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen, activeSection]);

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

  const handleTabClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(`section-${id}`);
    if (element && scrollContainerRef.current) {
      const top = element.offsetTop - 20; // Slight offset for padding
      scrollContainerRef.current.scrollTo({
        top,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  return (
    <aside
      className={cn(
        "fixed right-0 top-[72px] h-[calc(100vh-72px)] w-full sm:w-[400px] bg-white border-l border-slate-100 shadow-2xl z-[50] flex flex-col transition-transform duration-500 ease-in-out transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* 1. FIXED HEADER */}
      <header className="p-5 flex flex-col gap-1 flex-none bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="relative flex items-start gap-4 mb-4 pt-2">
          {/* Branding Icon */}
          <div className="flex-none w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
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
          <div className="flex-1 pr-10 pt-0.5">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-base font-bold text-slate-900 uppercase leading-none truncate">
                {device_name || device_id}
              </h2>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase leading-none border",
                  isOnline
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-slate-600 font-medium text-[13px] leading-tight">{fullName}</p>
              <p className="text-slate-400 text-[12px] leading-tight truncate">
                {assignment?.email || "Account Connected"}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Anchor Links */}
        <nav className="flex gap-5 border-b border-transparent overflow-x-auto no-scrollbar">
          {["Control", "Readings", "Components", "Alerts"].map((tab) => {
            const id = tab.toLowerCase();
            const isActive = activeSection === id;
            return (
              <a
                key={tab}
                href={`#section-${id}`}
                onClick={(e) => handleTabClick(e, id)}
                className={cn(
                  "font-display text-[13px] font-bold tracking-tight transition-all pb-2 border-b-2 whitespace-nowrap",
                  isActive 
                    ? "text-primary border-primary" 
                    : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                {tab}
              </a>
            );
          })}
        </nav>
      </header>

      {/* 2. SCROLLABLE CONTENT */}
      {/* Requirement: Use key={device_id} to force a full reset of sub-components and scroll position when switching devices */}
      <div 
        key={device_id} 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-10 pb-10 scroll-smooth"
      >
        {/* Overview Section */}
        <section id="section-overview" className="scroll-mt-6 pt-2">
          <h3 className="font-display text-base font-bold mb-4 text-primary">Overview</h3>
          <div className="grid grid-cols-2 gap-y-5 gap-x-5">
            <DetailItem icon={User} label="USER INFO" value={fullName} />
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
  <div className={cn("flex items-start gap-3", fullWidth && "col-span-2")}>
    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100/50 flex-none">
      <Icon size={18} className="text-primary" />
    </div>
    <div>
      <p className="font-display text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="font-sans text-[15px] font-semibold text-slate-700 leading-tight">{value}</p>
    </div>
  </div>
);

export default memo(DeviceDetailsPanel);
