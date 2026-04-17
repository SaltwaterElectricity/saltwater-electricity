import { useState, useCallback } from 'react';
import Toast from '../Toast';
import { ManagedDeviceCard } from './ManagedDeviceCard'; 
import { AdminMonitoringLayout } from './AdminMonitoringLayout';
import { UserDeviceLayout } from './UserDeviceLayout';
import { cn } from "../../../utils/cn";

const DeviceCard = ({ device, telemetry, currentUser, onAction, viewMode = "default" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [toastConfig, setToastConfig] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });

  const isAvailable = device.availability === 'available';
  const isAssignedToMe = device.assigned_user_id === currentUser?.id;
  const isSuperAdmin = currentUser?.role === 'superAdmin';
  const isAdmin = currentUser?.role === 'admin';
  const hasPrivilegedAccess = isSuperAdmin || isAdmin;

  const closeToast = useCallback(() => {
    setToastConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleSecureAction = async (actionType, payload) => {
    setIsProcessing(true);
    try {
      await onAction(actionType, payload); 
      if (actionType !== 'ASSIGN_DEVICE') {
        setToastConfig({
          isOpen: true,
          message: `Action ${actionType.replace('_', ' ')} processed successfully.`,
          type: "success"
        });
      }
    } catch (error) {
      setToastConfig({
        isOpen: true,
        message: "Security Error: Unauthorized action.",
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("animate-fadeIn relative h-full", isProcessing && "opacity-60 pointer-events-none")}>
      
      <Toast 
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={closeToast}
      />

      {/* STRATEGY: 
          Kapag nasa 'management' mode (DeviceManagement page), ManagedDeviceCard lang ang ipakita.
          Kapag nasa 'default' mode (Dashboard/Home), ipakita ang Monitoring Layouts.
      */}
      {viewMode === "management" ? (
        <ManagedDeviceCard 
          device={device} 
          onAssignClick={(d) => handleSecureAction('ASSIGN_DEVICE', d)} 
        />
      ) : (
        <>
          {isAvailable ? (
            <ManagedDeviceCard 
              device={device} 
              onAssignClick={(d) => handleSecureAction('ASSIGN_DEVICE', d)} 
            />
          ) : (
            <div className="space-y-4 h-full">
              {/* ADMIN MONITORING */}
              {hasPrivilegedAccess && (
                <AdminMonitoringLayout 
                  device={device} 
                  telemetry={telemetry} 
                  isSuper={isSuperAdmin} 
                />
              )}

              {/* USER VIEW */}
              {isAssignedToMe && !hasPrivilegedAccess && (
                <UserDeviceLayout 
                  deviceName={device.device_name} 
                  telemetry={telemetry} 
                  onViewHistory={() => handleSecureAction('VIEW_ANALYTICS', device.device_id)}
                />
              )}

              {/* SUPER ADMIN OVERRIDE - Nilinis ang UI para mag-match sa 8pt grid */}
              {isSuperAdmin && (
                <div className="p-6 bg-slate-900/90 backdrop-blur-md rounded-[24px] border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">
                      Critical: Root Override
                    </p>
                  </div>
                  <button 
                    onClick={() => handleSecureAction('FORCE_DEPROVISION', device.device_id)}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-[9px] font-black tracking-widest transition-all uppercase active:scale-95"
                  >
                    Force Release Binding
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeviceCard;