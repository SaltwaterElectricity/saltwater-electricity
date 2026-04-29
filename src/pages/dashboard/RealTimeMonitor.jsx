import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { useDevices } from '../../hooks'; 
import { 
  DeviceCard, 
  DeviceCardSkeleton, 
  CardErrorBoundary, 
  AssignDeviceModal 
} from '../../components';
import { ROUTES } from '../../constants/routes';
import Toast from '../../components/ui/Toast';

import { LayoutDashboard } from 'lucide-react';

const RealTimeMonitor = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { devices, telemetry, loading } = useDevices();

  // MODAL & TOAST STATES
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });

  // 1. FILTER LOGIC: Dito natin sasalain ang ipapakita base sa Role
  const filteredDevices = React.useMemo(() => {
    if (!devices) return [];

    // Kung Admin/SuperAdmin, ipakita lahat
    if (currentUser?.role === 'admin' || currentUser?.role === 'superAdmin') {
      return devices;
    }

    // Kung User, ipakita lang ang naka-assign sa kanya
    return devices.filter(d => d.assigned_user_id === currentUser?.id);
  }, [devices, currentUser]);

  const handleDeviceAction = async (type, payload) => {
    try {
      if (type === 'ASSIGN_DEVICE') {
        setSelectedDevice(payload);
        setIsAssignModalOpen(true);
      } else if (type === 'VIEW_ANALYTICS') {
        navigate(ROUTES.DASHBOARD);
      } else {
        console.log(`Action: ${type}`, payload);
        // Simulate or handle other actions
        setToastConfig({
          isOpen: true,
          message: `Action ${type.replace('_', ' ')} processed successfully.`,
          type: "success"
        });
      }
    } catch (error) {
      setToastConfig({
        isOpen: true,
        message: `Security Error: Action ${type} failed.`,
        type: "error"
      });
      throw error; // Re-throw for DeviceCard to stop processing state
    }
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setTimeout(() => setSelectedDevice(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 relative overflow-hidden">
        <BackgroundDecor />
        <header className="mb-12 flex items-end justify-between relative z-10">
          <div className="animate-pulse">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded" />
              <div className="h-3 w-32 bg-slate-200 rounded" />
            </div>
            <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 relative z-10">
          {[...Array(6)].map((_, i) => (
            <DeviceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-8 relative overflow-hidden antialiased">
      {/* GLASSMORPHISM DECORATION */}
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
              Live Monitoring System
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {currentUser?.role === 'user' ? 'My Managed Nodes' : 'Global Fleet Status'}
          </h1>
        </div>

        <div className="hidden text-right md:block animate-in slide-in-from-right-4 duration-500">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Network Status</p>
          <div className="flex items-center gap-2 justify-end mt-1">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-black text-emerald-500 uppercase">System Operational</p>
          </div>
        </div>
      </header>

      {/* GRID SECTION: 8pt Grid (gap-8 = 32px) */}
      <div className="relative z-10">
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredDevices.map((device) => (
              <CardErrorBoundary key={device.device_id}>
                <DeviceCard
                  device={device}
                  telemetry={telemetry?.[device.device_id]}
                  currentUser={currentUser}
                  onAction={handleDeviceAction}
                  viewMode="default"
                />
              </CardErrorBoundary>
            ))}
          </div>
        ) : (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-[40px] border border-white/40 bg-white/40 backdrop-blur-xl p-12 text-center shadow-xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-100/50 rounded-full flex items-center justify-center mb-6 border border-white/20">
              <LayoutDashboard size={32} className="text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">No active devices found.</p>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs">Check device assignments or contact system administrator for node initialization.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      <AssignDeviceModal 
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        device={selectedDevice}
      />
    </div>
  );
};

const BackgroundDecor = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px]" />
    <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-emerald-400/5 rounded-full blur-[100px]" />
  </div>
);

export default RealTimeMonitor;
