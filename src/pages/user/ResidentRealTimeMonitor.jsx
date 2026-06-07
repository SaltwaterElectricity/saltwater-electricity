import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useDevices, useAssignments, useAuditLogs } from "../../hooks";
import {
  UserDeviceLayout,
  ProvisionDeviceCard,
  DeviceCardSkeleton,
  CardErrorBoundary,
  DeviceRequestModal,
  SummaryCard,
  RecentAlertsFeed,
  EmptyState,
  DeviceDetailsPanel,
} from "../../components";
import { ROUTES } from "../../constants/routes";
import Toast from "../../components/ui/Toast";

/**
 * PAGE: ResidentRealTimeMonitor
 * Mirrored from user-real-time-monitor.html.
 * Pure resident experience for monitoring personal assigned devices.
 */
const ResidentRealTimeMonitor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { logs: auditLogs } = useAuditLogs(50); // Fetch more for detailed view

  // MODAL & PANEL STATES
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // TOAST STATE
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const triggerToast = (message, type = "success") => {
    setToastConfig({ isOpen: true, message, type });
  };

  // 1. FILTERING LOGIC: Only show resident's personal units
  const personalUnits = React.useMemo(() => {
    if (!devices || assignmentsLoading) return [];
    const myUid = user?.id || user?.uid;
    // Map devices that have an assignment to the current user
    return devices.filter((d) => assignments[d.device_id]?.userId === myUid);
  }, [devices, assignments, user, assignmentsLoading]);

  // Derive selected device data
  const selectedDevice = React.useMemo(() => 
    personalUnits.find(d => d.device_id === selectedDeviceId),
    [personalUnits, selectedDeviceId]
  );

  const handleRequestDevice = () => {
    setIsRequestModalOpen(true);
  };

  const handleViewDetails = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setIsPanelOpen(true);
  };

  const isLoading = devicesLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-10 animate-pulse">
          <div className="h-32 bg-white/50 rounded-[24px]" />
          <div className="h-[520px] bg-white/50 rounded-[24px]" />
        </div>
        <div className="xl:col-span-8 space-y-10">
          <div className="h-20 bg-white/50 rounded-[24px] animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {["s1", "s2", "s3", "s4"].map((id) => (
              <DeviceCardSkeleton key={id} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalDevicesFormatted = personalUnits.length.toString().padStart(2, "0");

  return (
    <div className="animate-fade-in antialiased">
      <Toast
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 1. PAGE HEADER SECTION */}
      <section className="pb-8 lg:pb-12">
        <h2 className="font-display text-4xl lg:text-5xl font-black text-on-surface tracking-tighter uppercase italic">
          My Devices
        </h2>
        <p className="font-body-md text-on-surface-variant text-base mt-2 max-w-2xl">
          Real-time oversight of your personal saltwater electricity infrastructure nodes.
        </p>
      </section>

      {/* 2. BENTO GRID MAIN CONTENT (12-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Summary & Alerts (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
          {/* Total Devices Card */}
          <SummaryCard
            variant="sparkline"
            title="Total Devices"
            value={totalDevicesFormatted}
            className="premium-card !p-8"
          />

          {/* Recent Alerts Feed (Widget Variant) */}
          <RecentAlertsFeed
            title="Recent Alerts"
            alerts={auditLogs}
            variant="widget"
            onViewAll={() => navigate(ROUTES.ALERTS)}
          />
        </div>

        {/* RIGHT COLUMN: Device Cards & CTA (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
          {/* REQUEST FOR ANOTHER DEVICE SECTION (Horizontal CTA) */}
          <ProvisionDeviceCard onAction={handleRequestDevice} />

          {/* PERSONAL NODES GRID */}
          {personalUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right-8 duration-700">
              {personalUnits.map((device) => (
                <CardErrorBoundary key={device.device_id}>
                  <UserDeviceLayout
                    deviceId={device.device_id}
                    deviceName={device.device_name}
                    telemetry={telemetry?.[device.device_id]}
                    assignment={assignments[device.device_id]}
                    onViewDetails={() => handleViewDetails(device.device_id)}
                    onViewHistory={() =>
                      navigate(ROUTES.DEVICE_ANALYTICS.replace(":deviceId", device.device_id))
                    }
                  />
                </CardErrorBoundary>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Node Offline: No active devices detected."
                description="Your account doesn't have any assigned monitoring units yet. Please submit a request or contact your facility administrator."
                actionText="Request New Device"
                onAction={handleRequestDevice}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS & PANELS */}
      <DeviceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onShowToast={triggerToast}
      />

      <DeviceDetailsPanel 
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        device={selectedDevice}
        telemetry={telemetry?.[selectedDeviceId]}
        assignment={{
          ...assignments[selectedDeviceId],
          ...user, // Hydrate with current user profile data
        }}
        auditLogs={auditLogs}
      />
    </div>
  );
};

export default ResidentRealTimeMonitor;
