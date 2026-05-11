import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/useAuth'; 
import { useDevices, useAssignments } from '../../hooks'; 
import { logger } from '../../utils/logger';
import { 
  DeviceCard, 
  DeviceCardSkeleton, 
  CardErrorBoundary,
  SystemAuditModal
} from '../../components';
import { ROUTES } from '../../constants/routes';
import Toast from '../../components/ui/Toast';

/**
 * RealTimeMonitor Page
 * Refactored to AlonKuryente Visual Language (code3.html & DESIGN3.md)
 */
const RealTimeMonitor = () => {
  const navigate = useNavigate();
  const { user, isAdmin, userRole } = useAuth();
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();

  // AUDIT MODAL STATE
  const [selectedAuditDevice, setSelectedAuditDevice] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // TOAST STATE
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });

  // 1. FILTER LOGIC
  const filteredDevices = React.useMemo(() => {
    if (!devices || assignmentsLoading) return [];
    if (isAdmin) {
      return devices.filter(d => assignments[d.device_id]);
    }
    return devices.filter(d => assignments[d.device_id]?.userId === (user?.id || user?.uid));
  }, [devices, assignments, user, isAdmin, assignmentsLoading]);

  const handleDeviceAction = async (type, payload) => {
    try {
      if (type === 'VIEW_ANALYTICS') {
        const dev = devices.find(d => d.device_id === payload);
        setSelectedAuditDevice(dev);
        setIsAuditModalOpen(true);
      } else {
        logger.log(`Dashboard Action: ${type}`, payload);
      }
    } catch (error) {
      setToastConfig({
        isOpen: true,
        message: `Navigation Error: ${error.message}`,
        type: "error"
      });
    }
  };

  const handleCloseAudit = () => {
    setIsAuditModalOpen(false);
    setTimeout(() => setSelectedAuditDevice(null), 300);
  };

  const handleRequestDevice = () => {
    navigate(ROUTES.DEVICE_REQUESTS);
  };

  if (devicesLoading || assignmentsLoading) {
    return (
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3 relative z-10">
        {['s1', 's2', 's3', 's4', 's5', 's6'].map((id) => <DeviceCardSkeleton key={id} />)}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn antialiased">
      <Toast 
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* HEADER & ACTION BAR */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <h1 className="font-display text-4xl lg:text-5xl text-on-surface tracking-tight">
            {isAdmin ? 'Global Fleet' : 'My Devices'}
          </h1>
          <p className="text-body-lg text-outline mt-2 max-w-2xl">
            {isAdmin 
              ? 'Real-time monitoring for decentralized water sensor infrastructure. Global oversight enabled.' 
              : 'Manage and monitor your decentralized water sensor nodes.'}
          </p>
        </div>

        <button 
          onClick={handleRequestDevice}
          className="flex items-center gap-2 px-6 py-4 ocean-gradient text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-transform shrink-0"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Request New Device
        </button>
      </header>

      {/* DEVICE GRID */}
      <div className="relative z-10 grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
        {filteredDevices.map((device) => (
          <CardErrorBoundary key={device.device_id}>
            <DeviceCard
              device={device}
              assignment={assignments[device.device_id]}
              telemetry={telemetry?.[device.device_id]}
              currentUser={{ ...user, role: userRole }}
              onAction={handleDeviceAction}
              viewMode="default"
            />
          </CardErrorBoundary>
        ))}

        {/* ADD DEVICE PLACEHOLDER (as per code3.html) */}
        {!isAdmin && (
          <div 
            onClick={handleRequestDevice}
            className="rounded-[24px] border-2 border-dashed border-outline-variant/50 p-6 flex flex-col items-center justify-center text-center gap-4 group hover:border-primary-container hover:bg-primary-container/5 transition-all duration-300 cursor-pointer h-full min-h-[280px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={32} className="text-outline group-hover:text-primary" />
            </div>
            <div>
              <p className="font-h2 text-xl text-on-surface">New Connection</p>
              <p className="text-sm text-outline font-body-md">Pair a new sensor node via Bluetooth</p>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <SystemAuditModal 
        isOpen={isAuditModalOpen}
        onClose={handleCloseAudit}
        deviceId={selectedAuditDevice?.device_id}
        deviceName={selectedAuditDevice?.device_name}
      />
    </div>
  );
};

export default RealTimeMonitor;
