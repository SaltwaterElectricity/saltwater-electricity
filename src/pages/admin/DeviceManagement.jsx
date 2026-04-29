import { useState, useMemo, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { useDevices } from '../../hooks';
import { DeviceCard, AssignDeviceModal, Toast } from '../../components';
import { useNotification } from '../../context/NotificationContext';

// Clean Code: Move Constants outside to avoid re-creation
const STATUS_AVAILABLE = 'available';

const DeviceManagement = () => {
  const { devices, loading, error } = useDevices();
  const { showNotification } = useNotification();
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Performance Safety: Use useMemo for heavy filtering
  const { availableDevices, occupiedDevices } = useMemo(() => ({
    availableDevices: devices.filter(d => d.availability === STATUS_AVAILABLE),
    occupiedDevices: devices.filter(d => d.availability !== STATUS_AVAILABLE)
  }), [devices]);

  // Security Check: Ensure user is authorized before modal opens
  const handleDeviceAction = async (actionType, device) => {
    if (!currentUser) {
      showNotification("Security: Unauthorized access blocked.", "error");
      return;
    }

    try {
      if (actionType === 'ASSIGN_DEVICE') {
        setSelectedDevice(device);
        setIsModalOpen(true);
      } else {
        console.log(`[DeviceManagement] Action: ${actionType}`, device);
        showNotification(`Action ${actionType.replace('_', ' ')} processed successfully.`, "success");
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

  // Error Boundary Safety
  if (error) return <ErrorMessage message={error} />;
  if (loading || authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 space-y-16 relative overflow-hidden">
      {/* BACKGROUND DECORATION */}
      <BackgroundDecor />

      <header className="relative z-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">SmartAqua <span className="text-blue-600">Hub</span></h1>
        <p className="text-slate-500 font-medium mt-2">Manage IoT deployments and node availability.</p>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <StatCard label="Total Capacity" value={devices.length} subLabel="Units" />
        <StatCard label="Ready for Setup" value={availableDevices.length} isHighlight />
      </div>

      <div className="space-y-20 relative z-10">
        {/* AVAILABLE SECTION */}
        <DeviceSection 
          title="Available Inventory" 
          items={availableDevices} 
          onAction={handleDeviceAction}
          currentUser={currentUser}
          isEmpty={availableDevices.length === 0}
        />

        {/* DEPLOYED SECTION */}
        {occupiedDevices.length > 0 && (
          <DeviceSection 
            title="Deployed Units" 
            items={occupiedDevices} 
            onAction={handleDeviceAction}
            currentUser={currentUser}
            isDimmed
          />
        )}
      </div>

      <AssignDeviceModal
        device={selectedDevice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// --- Sub-Components for Clean Code ---

const StatCard = ({ label, value, subLabel, isHighlight }) => (
  <div className="bg-white/60 backdrop-blur-md p-6 rounded-[28px] border border-white/80 shadow-sm">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${isHighlight ? 'text-blue-600' : 'text-slate-900'}`}>
      {value} {subLabel && <span className="text-sm text-slate-400">{subLabel}</span>}
    </p>
  </div>
);

const DeviceSection = ({ title, items, onAction, currentUser, isEmpty, isDimmed }) => (
  <section className={isDimmed ? "opacity-80 grayscale-[0.2] hover:opacity-100 transition-all duration-500" : ""}>
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-100 backdrop-blur-sm">
        {title}
      </h2>
      <div className="h-[1px] flex-1 bg-slate-200/50" />
    </div>

    {isEmpty ? (
      <div className="bg-white/40 backdrop-blur-sm p-16 text-center rounded-[32px] border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Empty inventory.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map(device => (
          <DeviceCard 
            key={device.id || device.device_id} 
            device={device} 
            currentUser={currentUser} 
            onAction={onAction} 
            viewMode="management"
          />
        ))}
      </div>
    )}
  </section>
);

const BackgroundDecor = () => (
  <>
    <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
    <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
  </>
);

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex h-screen items-center justify-center bg-[#f8fafc] p-6 text-center">
    <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-md">
      <p className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2">Error Detected</p>
      <p className="text-slate-900 font-black">{message}</p>
    </div>
  </div>
);

export default DeviceManagement;