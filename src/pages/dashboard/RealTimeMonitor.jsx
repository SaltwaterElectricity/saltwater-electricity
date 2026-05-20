import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Activity, Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useDevices, useAssignments, useAuditLogs } from "../../hooks";
import { logger } from "../../utils/logger";
import {
  AdminMonitoringLayout,
  UserDeviceLayout,
  ProvisionDeviceCard,
  DeviceCardSkeleton,
  CardErrorBoundary,
  SystemAuditModal,
  DeviceRequestModal,
} from "../../components";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import Toast from "../../components/ui/Toast";
import { cn } from "../../utils/cn";

/**
 * RealTimeMonitor Page
 * Refactored to mirror saltwater.realtime monitor.html (12-column grid layout).
 * Implementing split layout: Left (Stats/Alerts) | Right (Device Grid).
 */
const RealTimeMonitor = () => {
  const navigate = useNavigate();
  const { user, isAdmin, userRole } = useAuth();
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { logs: auditLogs } = useAuditLogs(10);

  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  // MODAL STATES
  const [selectedAuditDevice, setSelectedAuditDevice] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // TOAST STATE
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToastConfig({ isOpen: true, message, type });
  };

  // 1. GROUPING LOGIC: Separate personal units from global fleet
  const { personalUnits, globalFleet } = React.useMemo(() => {
    if (!devices || assignmentsLoading) return { personalUnits: [], globalFleet: [] };

    const myUid = user?.id || user?.uid;
    const personal = devices.filter((d) => assignments[d.device_id]?.userId === myUid);

    if (isAdmin) {
      const global = devices.filter(
        (d) => assignments[d.device_id] && assignments[d.device_id]?.userId !== myUid
      );
      return { personalUnits: personal, globalFleet: global };
    }

    return { personalUnits: personal, globalFleet: [] };
  }, [devices, assignments, user, isAdmin, assignmentsLoading]);

  const handleDeviceAction = async (type, payload) => {
    try {
      if (type === "VIEW_ANALYTICS") {
        const dev = devices.find((d) => d.device_id === payload);
        setSelectedAuditDevice(dev);
        setIsAuditModalOpen(true);
      } else if (type === "FORCE_DEPROVISION") {
        logger.log("Super Admin Action: FORCE_DEPROVISION", payload);
        setToastConfig({
          isOpen: true,
          message: "System override initiated. Deprovisioning hardware...",
          type: "success",
        });
      } else {
        logger.log(`Dashboard Action: ${type}`, payload);
      }
    } catch (error) {
      setToastConfig({
        isOpen: true,
        message: `Navigation Error: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleCloseAudit = () => {
    setIsAuditModalOpen(false);
    setSelectedAuditDevice(null);
  };

  const handleRequestDevice = () => {
    setIsRequestModalOpen(true);
  };

  if (devicesLoading || assignmentsLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-8 animate-pulse">
          <div className="h-20 bg-white/50 rounded-2xl" />
          <div className="h-40 bg-white/50 rounded-2xl" />
          <div className="h-[400px] bg-white/50 rounded-2xl" />
        </div>
        <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {["s1", "s2", "s3", "s4"].map((id) => (
            <DeviceCardSkeleton key={id} />
          ))}
        </div>
      </div>
    );
  }

  const totalDevicesFormatted = (personalUnits.length + globalFleet.length)
    .toString()
    .padStart(2, "0");

  return (
    <div className="animate-fade-in antialiased min-h-screen pb-12">
      <Toast
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* DASHBOARD GRID (12-column) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Summary & Alerts (col-span-4) */}
        <div className="xl:col-span-4 space-y-8">
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase font-display italic">
              {isAdmin ? "Grid Oversight" : "My Devices"}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-body-md">
              {isAdmin
                ? "Real-time management of decentralized water sensor infrastructure."
                : "Monitor real-time readings of your saltwater electricity devices."}
            </p>
          </div>

          {/* Total Devices Summary Card */}
          <div className="bg-cardBg p-8 rounded-2xl shadow-premium flex items-center justify-between border border-white/40 group hover:border-primary/20 transition-all duration-500">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Total Devices
              </p>
              <h3 className="text-5xl font-black text-slate-900 tabular-nums font-display italic">
                {totalDevicesFormatted}
              </h3>
            </div>
            {/* Sparkline visual placeholder */}
            <div className="flex items-end space-x-1 h-12">
              <div className="w-1.5 bg-slate-100 rounded-full h-4" />
              <div className="w-1.5 bg-slate-200 rounded-full h-6" />
              <div className="w-1.5 bg-slate-300 rounded-full h-10" />
              <div className="w-1.5 bg-primary rounded-full h-12 shadow-[0_0_15px_rgba(10,46,255,0.4)] group-hover:scale-y-110 transition-transform origin-bottom" />
              <div className="w-1.5 bg-primary/60 rounded-full h-8" />
              <div className="w-1.5 bg-primary/40 rounded-full h-5" />
            </div>
          </div>

          {/* Recent Alerts Sidebar Card */}
          <div className="bg-cardBg rounded-3xl shadow-premium flex flex-col h-[520px] border border-white/40 overflow-hidden transition-all hover:shadow-2xl">
            <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">
                Recent Alerts
              </h3>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Bell size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => {
                  const isCritical =
                    log.action.includes("FAILURE") ||
                    log.action.includes("CRITICAL") ||
                    log.action.includes("DEP");
                  const isWarning = log.action.includes("WARNING") || log.action.includes("UPDATE");

                  return (
                    <div
                      key={log.id}
                      className="flex items-start space-x-4 p-3 -m-3 hover:bg-slate-50/80 rounded-2xl transition-all cursor-default group"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all group-hover:scale-110",
                          isCritical
                            ? "bg-red-50 text-red-500 border-red-100 shadow-sm shadow-red-100"
                            : isWarning
                              ? "bg-orange-50 text-orange-500 border-orange-100 shadow-sm shadow-orange-100"
                              : "bg-blue-50 text-blue-500 border-blue-100 shadow-sm shadow-blue-100"
                        )}
                      >
                        {isCritical ? (
                          <ShieldAlert size={18} />
                        ) : isWarning ? (
                          <Clock size={18} />
                        ) : (
                          <Activity size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 truncate uppercase tracking-tighter">
                            {log.action.replace(/_/g, " ")}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed line-clamp-2">
                          {log.details || "System activity recorded."}
                        </p>
                        <p className="text-[9px] text-slate-300 mt-1.5 font-bold uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleDateString()} •{" "}
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                  <Activity size={40} className="mb-4 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    No active alerts recorded.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-50 text-center bg-slate-50/30">
              <button
                onClick={() => navigate(ROUTES.ALERTS)}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Device Cards (col-span-8) */}
        <div className="xl:col-span-8 space-y-12">
          {/* PROVISIONING CTA (Top of grid) - Mirroring Option B from Prototype */}
          <ProvisionDeviceCard onAction={handleRequestDevice} />

          {/* 1. PERSONAL UNITS SECTION */}
          {personalUnits.length > 0 && (
            <section className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                  Personal Units
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {personalUnits.map((device) => (
                  <CardErrorBoundary key={device.device_id}>
                    <UserDeviceLayout
                      deviceId={device.device_id}
                      deviceName={device.device_name}
                      telemetry={telemetry?.[device.device_id]}
                      assignment={assignments[device.device_id]}
                      onViewHistory={() => handleDeviceAction("VIEW_ANALYTICS", device.device_id)}
                    />
                  </CardErrorBoundary>
                ))}
              </div>
            </section>
          )}

          {/* 2. GLOBAL FLEET SECTION (Admin Only) */}
          {isAdmin && globalFleet.length > 0 && (
            <section className="space-y-8 animate-in slide-in-from-right-4 duration-700">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-100">
                  Global Fleet Oversight
                </h2>
                <div className="h-[1px] flex-1 bg-slate-200/50" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {globalFleet.map((device) => (
                  <CardErrorBoundary key={device.device_id}>
                    <div className="glass-panel rounded-[24px] overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col h-full animate-fade-in p-8 border border-white/40">
                      <AdminMonitoringLayout
                        device={device}
                        telemetry={telemetry?.[device.device_id]}
                        onViewAnalytics={() =>
                          handleDeviceAction("VIEW_ANALYTICS", device.device_id)
                        }
                      />

                      {/* SUPER ADMIN OVERRIDE */}
                      {isSuperAdmin && (
                        <div className="mt-auto pt-6">
                          <div className="p-4 bg-inverse-surface rounded-xl border border-white/10 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                              <p className="text-[10px] font-bold text-error uppercase tracking-widest font-body-md">
                                Root Override
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeviceAction("FORCE_DEPROVISION", device.device_id)
                              }
                              className="w-full py-2 bg-error/10 hover:bg-error text-error hover:text-on-error border border-error/20 rounded-lg text-[10px] font-bold tracking-widest transition-all uppercase"
                            >
                              Force Release
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardErrorBoundary>
                ))}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {personalUnits.length === 0 && (!isAdmin || globalFleet.length === 0) && (
            <div className="bg-white/40 backdrop-blur-sm p-32 text-center rounded-[48px] border-2 border-dashed border-slate-200 relative z-10 animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Activity size={32} />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                Grid Offline: No active nodes detected.
              </p>
              <button
                onClick={handleRequestDevice}
                className="mt-6 bg-primary/10 text-primary px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                Submit Provisioning Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <SystemAuditModal
        isOpen={isAuditModalOpen}
        onClose={handleCloseAudit}
        deviceId={selectedAuditDevice?.device_id}
        deviceName={selectedAuditDevice?.device_name}
      />

      <DeviceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onShowToast={triggerToast}
      />
    </div>
  );
};

export default RealTimeMonitor;
