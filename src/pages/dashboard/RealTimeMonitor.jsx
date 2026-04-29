import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { LayoutDashboard } from 'lucide-react';

/**
 * RealTimeMonitor Page
 * DASHBOARD VIEW: Purely for monitoring telemetry. 
 * NO management/assignment actions allowed here.
 */
const RealTimeMonitor = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();

  // AUDIT MODAL STATE
  const [selectedAuditDevice, setSelectedAuditDevice] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // TOAST STATE (For general feedback)
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });

  // 1. FILTER LOGIC: Robust role detection using assignments
  const filteredDevices = React.useMemo(() => {
    if (!devices || assignmentsLoading) return [];

    // Kung Admin/SuperAdmin, ipakita ang lahat ng devices na "assigned" na (Global Fleet)
    if (isAdmin) {
      return devices.filter(d => assignments[d.device_id]);
    }

    // Kung regular User, ipakita LANG ang naka-assign sa kanya
    return devices.filter(d => assignments[d.device_id]?.userId === (user?.id || user?.uid));
  }, [devices, assignments, user, isAdmin, assignmentsLoading]);

  const handleDeviceAction = async (type, payload) => {
    try {
      if (type === 'VIEW_ANALYTICS') {
        const dev = devices.find(d => d.device_id === payload);
        setSelectedAuditDevice(dev);
        setIsAuditModalOpen(true);
      } else {
        // Log other actions but do not open modals (Assign flow moved to DeviceManagement)
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

  if (devicesLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 relative overflow-hidden">
        <BackgroundDecor />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 relative z-10">
          {[...Array(6)].map((_, i) => <DeviceCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-8 relative overflow-hidden antialiased">
      <BackgroundDecor />

      <Toast 
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setToastConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* HEADER SECTION */}
      <header className="mb-12 flex items-end justify-between relative z-10">
        <div className="animate-in slide-in-from-left-4 duration-500">
          <div className="mb-2 flex items-center gap-2">
            <div className="p-2 bg-blue-600/10 rounded-lg backdrop-blur-sm">
              <LayoutDashboard size={16} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Fleet Telemetry
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {isAdmin ? 'Global Fleet Status' : 'My Managed Nodes'}
          </h1>
        </div>
      </header>

      {/* GRID SECTION: Using DeviceCard in "default" (View-Only) mode */}
      <div className="relative z-10">
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredDevices.map((device) => (
              <CardErrorBoundary key={device.device_id}>
                <DeviceCard
                  device={device}
                  assignment={assignments[device.device_id]}
                  telemetry={telemetry?.[device.device_id]}
                  currentUser={user} // Pass the 'user' object (with role) to the card
                  onAction={handleDeviceAction}
                  viewMode="default" // Force View-Only Mode
                />
              </CardErrorBoundary>
            ))}
          </div>
        ) : (
          <EmptyState />
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

const EmptyState = () => (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-[40px] border border-white/40 bg-white/40 backdrop-blur-xl p-12 text-center shadow-xl">
        <LayoutDashboard size={32} className="text-slate-300 mb-6" />
        <p className="text-xl font-black text-slate-900 tracking-tight">No active nodes monitored.</p>
        <p className="text-sm font-medium text-slate-500 mt-2">Go to Device Management to provision new hardware.</p>
    </div>
);

const BackgroundDecor = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px]" />
  </div>
);

export default RealTimeMonitor;
