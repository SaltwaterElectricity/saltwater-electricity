import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { ManagedDeviceCard } from './ManagedDeviceCard'; 
import { AdminMonitoringLayout } from './AdminMonitoringLayout';
import { UserDeviceLayout } from './UserDeviceLayout';
import { cn } from "../../utils/cn";
import { logger } from "../../utils/logger";

const DeviceCard = ({ device, assignment, telemetry, currentUser, onAction, viewMode = "default" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // RBAC DETERMINATION
  const isAvailable = device.availability === 'available';
  // Use the assignment prop to check user binding
  const isAssignedToMe = assignment?.userId === (currentUser?.id || currentUser?.uid);
  
  const isSuperAdmin = currentUser?.role === 'superAdmin';
  const isAdmin = currentUser?.role === 'admin';
  const hasPrivilegedAccess = isSuperAdmin || isAdmin;

  const handleSecureAction = async (actionType, payload) => {
    setIsProcessing(true);
    try {
      await onAction(actionType, payload); 
    } catch (error) {
      logger.error(`[DeviceCard] Action ${actionType} failed:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={cn("animate-fadeIn relative h-full", isProcessing && "opacity-60 pointer-events-none")}>
      
      {/* STRATEGY: 
          Kapag nasa 'management' mode (DeviceManagement page), ManagedDeviceCard lang ang ipakita.
          Kapag nasa 'default' mode (Dashboard/Home), ipakita ang Monitoring Layouts.
      */}
      {viewMode === "management" ? (
        <ManagedDeviceCard 
          device={device} 
          isAdmin={hasPrivilegedAccess}
          onAssignClick={(d) => handleSecureAction('ASSIGN_DEVICE', d)} 
          onForceRelease={(id) => handleSecureAction('FORCE_DEPROVISION', id)}
        />
      ) : (
        <>
          {/* Dashboard Mode: Only show active monitoring layouts. 
              If available, show a placeholder or nothing to avoid accidental assignment flows. */}
          {isAvailable ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[32px] border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center h-full opacity-60">
               <Cpu size={24} className="text-slate-400 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Standby</p>
               <p className="text-[8px] font-bold text-slate-400 mt-1">Awaiting Deployment</p>
            </div>
          ) : (
            <div className="group bg-white/70 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl p-8 h-full space-y-8 transition-all duration-500 hover:shadow-2xl hover:bg-white/80">
              {/* ADMIN MONITORING */}
              {hasPrivilegedAccess && (
                <AdminMonitoringLayout 
                  device={device} 
                  telemetry={telemetry} 
                  onViewAnalytics={() => handleSecureAction('VIEW_ANALYTICS', device.device_id)}
                />
              )}

              {/* USER VIEW */}
              {isAssignedToMe && !hasPrivilegedAccess && (
                <UserDeviceLayout 
                  deviceId={device.device_id}
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
