import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SummaryCard,
  RecentAlertsFeed,
  DashboardSectionHeader,
  EmptyState,
} from "../../components";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import Toast from "../../components/ui/Toast";

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
          <SummaryCard
            variant="sparkline"
            title="Total Devices"
            value={totalDevicesFormatted}
          />

          {/* Recent Alerts Sidebar Feed */}
          <RecentAlertsFeed 
            alerts={auditLogs}
            onViewAll={() => navigate(ROUTES.ALERTS)}
          />
        </div>

        {/* RIGHT COLUMN: Device Cards (col-span-8) */}
        <div className="xl:col-span-8 space-y-12">
          {/* PROVISIONING CTA (Top of grid) - Mirroring Option B from Prototype */}
          <ProvisionDeviceCard onAction={handleRequestDevice} />

          {/* 1. PERSONAL UNITS SECTION */}
          {personalUnits.length > 0 && (
            <section className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <DashboardSectionHeader title="Personal Units" />

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
              <DashboardSectionHeader title="Global Fleet Oversight" variant="neutral" />

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
            <EmptyState 
              title="Grid Offline: No active nodes detected."
              actionText="Submit Provisioning Request"
              onAction={handleRequestDevice}
            />
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
