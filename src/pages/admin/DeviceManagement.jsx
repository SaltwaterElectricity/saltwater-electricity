import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useDevices } from "../../hooks";
import {
  ManagedDeviceCard,
  AssignDeviceModal,
  ConfirmationModal,
  SummaryCard,
  DashboardSectionHeader,
  EmptyState,
  LoadingSpinner,
} from "../../components";
import { useNotification } from "../../context/useNotification";
import { logger } from "../../utils/logger";
import { deprovisionDevice } from "../../services/device.service";
import { ShieldAlert, Plus } from "lucide-react";

// Clean Code: Move Constants outside to avoid re-creation
const STATUS_AVAILABLE = "available";

const DeviceManagement = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { devices, loading, error } = useDevices();
  const { showNotification } = useNotification();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CONFIRMATION MODAL STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    deviceId: null,
    isSubmitting: false,
  });

  // Performance Safety: Use useMemo for heavy filtering
  const { availableDevices, occupiedDevices } = useMemo(
    () => ({
      availableDevices: devices.filter((d) => d.availability === STATUS_AVAILABLE),
      occupiedDevices: devices.filter((d) => d.availability !== STATUS_AVAILABLE),
    }),
    [devices]
  );

  // Security Check: Ensure user is authorized before modal opens
  const handleDeviceAction = async (actionType, payload) => {
    if (!currentUser) {
      showNotification("Security: Unauthorized access blocked.", "error");
      return;
    }

    try {
      if (actionType === "ASSIGN_DEVICE") {
        setSelectedDevice(payload);
        setIsModalOpen(true);
      } else if (actionType === "FORCE_DEPROVISION") {
        // payload is deviceId in this case
        setConfirmModal({
          isOpen: true,
          deviceId: payload,
          isSubmitting: false,
        });
      } else {
        logger.log(`[DeviceManagement] Action: ${actionType}`, payload);
        showNotification(
          `Action ${actionType.replace("_", " ")} processed successfully.`,
          "success"
        );
      }
    } catch (error) {
      showNotification(`Error: Action ${actionType} failed.`, "error");
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDevice(null), 300);
  };

  const handleConfirmDeprovision = async () => {
    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await deprovisionDevice(confirmModal.deviceId);
      showNotification("Device has been released and is now available.", "success");
      setConfirmModal({ isOpen: false, deviceId: null, isSubmitting: false });
    } catch (error) {
      showNotification(error.message, "error");
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Error Boundary Safety
  if (error) return <ErrorMessage message={error?.message || error} />;
  if (loading || authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 space-y-16 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <BackgroundDecor />

      <header className="relative z-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
          SaltwaterElectricity <span className="text-blue-600">Hub</span>
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Manage IoT deployments and node availability.
        </p>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <SummaryCard 
          title="Total Capacity" 
          value={devices.length} 
          subtitle="Units"
          icon="inventory_2"
          bgClass="bg-white/60 backdrop-blur-md"
        />
        <SummaryCard 
          title="Ready for Setup" 
          value={availableDevices.length} 
          subtitle="Available"
          icon="add_circle"
          colorClass="text-blue-600"
          bgClass="bg-white/60 backdrop-blur-md"
        />
      </div>

      <div className="space-y-20 relative z-10">
        {/* AVAILABLE SECTION */}
        <section className="space-y-8">
          <DashboardSectionHeader title="Available Inventory" variant="neutral" />
          
          {availableDevices.length === 0 ? (
            <EmptyState title="Empty inventory." icon={Plus} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {availableDevices.map((device) => (
                <ManagedDeviceCard
                  key={device.id || device.device_id}
                  device={device}
                  isAdmin={currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"}
                  onAssignClick={(d) => handleDeviceAction("ASSIGN_DEVICE", d)}
                  onForceRelease={(id) => handleDeviceAction("FORCE_DEPROVISION", id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* DEPLOYED SECTION */}
        {occupiedDevices.length > 0 && (
          <section className="space-y-8 opacity-80 grayscale-[0.2] hover:opacity-100 transition-all duration-500">
            <DashboardSectionHeader title="Deployed Units" variant="neutral" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {occupiedDevices.map((device) => (
                <ManagedDeviceCard
                  key={device.id || device.device_id}
                  device={device}
                  isAdmin={currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"}
                  onAssignClick={(d) => handleDeviceAction("ASSIGN_DEVICE", d)}
                  onForceRelease={(id) => handleDeviceAction("FORCE_DEPROVISION", id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <AssignDeviceModal device={selectedDevice} isOpen={isModalOpen} onClose={handleCloseModal} />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeprovision}
        isSubmitting={confirmModal.isSubmitting}
        title="Confirm Device Release"
        description="This will remove the current user assignment and reset the device status to 'Available'. This action cannot be undone."
        confirmText="Release Hardware"
        variant="danger"
      >
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              System Override
            </p>
            <p className="text-[10px] text-amber-700 font-bold leading-tight mt-0.5">
              The hardware will be immediately available for re-assignment after this process
              completes.
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

const BackgroundDecor = () => (
  <>
    <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
    <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
  </>
);

const ErrorMessage = ({ message }) => (
  <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6 text-center">
    <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-md">
      <p className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2">
        Error Detected
      </p>
      <p className="text-slate-900 font-black">
        {typeof message === "object" ? message?.message || "An unexpected error occurred" : message}
      </p>
    </div>
  </div>
);

export default DeviceManagement;
