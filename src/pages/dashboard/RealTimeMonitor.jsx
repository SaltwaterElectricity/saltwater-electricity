import React from 'react';
import { useAuth } from '../../../hooks/useAuth'; // Halimbawa ng auth hook mo
import { useDevices } from '../../../hooks/useDevices'; // Hook para sa real-time firebase data
import DeviceCard from './DeviceCard';
import { LayoutDashboard, Activity } from 'lucide-react';

const RealTimeMonitor = () => {
  const { currentUser } = useAuth();
  const { devices, telemetry, loading } = useDevices();

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
    console.log(`Action: ${type}`, payload);
    // Dito papasok ang logic para sa database updates
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      {/* HEADER SECTION */}
      <header className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <LayoutDashboard size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Live Monitoring System
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {currentUser?.role === 'user' ? 'My Managed Nodes' : 'Global Fleet Status'}
          </h1>
        </div>
        
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-bold uppercase text-slate-400">Network Status</p>
          <p className="text-sm font-black text-emerald-500">SYSTEM OPERATIONAL</p>
        </div>
      </header>

      {/* GRID SECTION: 8pt Grid (gap-8 = 32px) */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.device_id}
              device={device}
              telemetry={telemetry?.[device.device_id]} // I-pass ang specific telemetry ng device
              currentUser={currentUser}
              onAction={handleDeviceAction}
              viewMode="default" // "default" mode para lumabas ang layouts
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-xl font-bold text-slate-400">No active devices found.</p>
          <p className="text-sm text-slate-400">Check device assignments or system connectivity.</p>
        </div>
      )}
    </div>
  );
};

export default RealTimeMonitor;