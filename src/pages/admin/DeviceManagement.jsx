import { useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { useDevices } from "../../hooks";
import { DeviceManagementSkeleton } from "../../components/skeleton";
import {
  ManagedDeviceCard,
  AssignDeviceModal,
  ConfirmationModal,
  GlobalSearch,
  EmptyState,
} from "../../components";
import { useNotification } from "../../context/useNotification";
import { logger } from "../../utils/logger";
import { deprovisionDevice } from "../../services/device.service";
import { ShieldAlert, Search } from "lucide-react";

import { ROLES } from "../../constants/roles";

const STATUS_AVAILABLE = "available";

const DeviceManagement = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const { devices, loading, error } = useDevices();
  const { showNotification } = useNotification();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    deviceId: null,
    isSubmitting: false,
  });

  const { availableDevices, occupiedDevices, filteredDevices } = useMemo(() => {
    let list = devices;

    if (searchTerm) {
      list = list.filter(
        (d) =>
          d.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "All Status") {
      list = list.filter((d) => d.availability === statusFilter.toLowerCase());
    }

    return {
      availableDevices: devices.filter((d) => d.availability === STATUS_AVAILABLE),
      occupiedDevices: devices.filter((d) => d.availability !== STATUS_AVAILABLE),
      filteredDevices: list,
    };
  }, [devices, searchTerm, statusFilter]);

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
    } catch (err) {
      showNotification(`Error: Action ${actionType} failed.`, "error");
      throw err;
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
    } catch (err) {
      showNotification(err.message, "error");
      setConfirmModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  if (error) return <ErrorMessage message={error?.message || error} />;
  if (loading || authLoading) return <DeviceManagementSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight">Device Management</h1>
        <p className="text-lg text-slate-500 max-w-3xl">
          Manage all Saltwater Electricity devices, assign available units, and monitor deployed
          devices across household users with precision monitoring.
        </p>
      </section>

      {/* Summary Section Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Devices Card */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#4d7fff] to-[#0050cb] flex items-center justify-center text-white shadow-[0_8px_16px_-4px_rgba(0,80,203,0.3)]">
            <span className="material-symbols-outlined text-[32px]">devices</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-slate-500">Total Devices</p>
            <h3 className="text-3xl font-bold text-slate-900 leading-tight">{devices.length}</h3>
            <p className="text-[12px] text-slate-400">Registered Devices</p>
          </div>
        </div>

        {/* Available Devices Card */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#4ade80] to-[#16a34a] flex items-center justify-center text-white shadow-[0_8px_16px_-4px_rgba(22,163,74,0.3)]">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-slate-500">Available Devices</p>
            <h3 className="text-3xl font-bold text-slate-900 leading-tight">
              {availableDevices.length}
            </h3>
            <p className="text-[12px] text-slate-400">Ready for Assignment</p>
          </div>
        </div>

        {/* Assigned Devices Card */}
        <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#ea580c] flex items-center justify-center text-white shadow-[0_8px_16px_-4px_rgba(234,88,12,0.3)]">
            <span className="material-symbols-outlined text-[32px]">folder_shared</span>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-slate-500">Assigned Devices</p>
            <h3 className="text-3xl font-bold text-slate-900 leading-tight">
              {occupiedDevices.length}
            </h3>
            <p className="text-[12px] text-slate-400">Currently Assigned</p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full flex-1">
          <GlobalSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search device name or ID"
            variant="solid"
            className="flex-1"
          />
          <select
            className="w-full md:w-40 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-blue-600 font-semibold py-2.5 px-4 outline-none transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="disabled">Disabled</option>
          </select>
          <select className="w-full md:w-48 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-blue-600 font-semibold py-2.5 px-4 outline-none transition-all">
            <option>All Locations</option>
            <option>Pulo 1 Alibijaban, San Andres Quezon</option>
            <option>Pulo 2 Alibijaban, San Andres Quezon</option>
          </select>
        </div>
      </section>

      {/* Device Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredDevices.map((device) => (
          <ManagedDeviceCard
            key={device.id || device.device_id}
            device={device}
            isAdmin={currentUser?.role === ROLES.ADMIN || currentUser?.role === ROLES.SUPER_ADMIN}
            onAssignClick={(d) => handleDeviceAction("ASSIGN_DEVICE", d)}
            onForceRelease={(id) => handleDeviceAction("FORCE_DEPROVISION", id)}
          />
        ))}
        {filteredDevices.length === 0 && (
          <EmptyState
            icon={Search}
            title="No devices found"
            description="Try adjusting your search or filters to find what you're looking for."
            className="col-span-full"
          />
        )}
      </section>

      <AssignDeviceModal
        device={selectedDevice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onShowToast={showNotification}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDeprovision}
        isSubmitting={confirmModal.isSubmitting}
        title="Unassigned Device"
        description="Are you sure you want to unassign this hardware? This action will stop all real-time monitoring and alert notifications for this unit."
        confirmText="Confirm Unassigned"
        variant="danger"
      >
        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <ShieldAlert className="text-blue-600 w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            The hardware will be immediately available for re-assignment after this process
            completes. This can be undone by an administrator later.
          </p>
        </div>
      </ConfirmationModal>
    </div>
  );
};

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
