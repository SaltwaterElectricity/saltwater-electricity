import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ROLES } from "../../constants/roles";
import { SENSOR_CONFIG, METRICS } from "../../constants";
import { ManagedDeviceCard } from './ManagedDeviceCard'; 
import { AdminMonitoringLayout } from './AdminMonitoringLayout';
import { UserDeviceLayout } from './UserDeviceLayout';
import { cn } from "../../utils/cn";
import { logger } from "../../utils/logger";

const DeviceCard = ({ device, assignment, telemetry, currentUser, onAction, viewMode = "default" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // RBAC DETERMINATION
  const isAvailable = device.availability === 'available';
  const isAssignedToMe = assignment?.userId === (currentUser?.id || currentUser?.uid);
  
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const hasPrivilegedAccess = isSuperAdmin || isAdmin;

  // Status check for warning border using centralized thresholds
  const voltageThreshold = SENSOR_CONFIG[METRICS.VOLTAGE]?.warning || 3.2;
  const isWarning = device.status === 'Warning' || (telemetry?.voltage < voltageThreshold && !isAvailable);

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
    <div className={cn(
      "animate-fadeIn relative h-full transition-all duration-300", 
      isProcessing && "opacity-60 pointer-events-none"
    )}>
      
      {viewMode === "management" ? (
        <ManagedDeviceCard 
          device={device} 
          isAdmin={hasPrivilegedAccess}
          onAssignClick={(d) => handleSecureAction('ASSIGN_DEVICE', d)} 
          onForceRelease={(id) => handleSecureAction('FORCE_DEPROVISION', id)}
        />
      ) : (
        isAvailable ? (
          <div className="glass-panel rounded-[20px] p-6 flex flex-col items-center justify-center text-center h-[280px] group hover:border-primary-container hover:bg-primary-container/5 transition-all duration-300 cursor-pointer">
             <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
               <Plus size={32} className="text-outline group-hover:text-primary" />
             </div>
             <div>
               <p className="font-h2 text-xl text-on-surface">New Connection</p>
               <p className="text-sm text-outline font-body-md">Pair a new sensor node via Bluetooth</p>
             </div>
          </div>
        ) : (
          <div className={cn(
            "glass-panel rounded-[20px] overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col h-full",
            isWarning && "border-l-4 border-error/50"
          )}>
            <div className="p-6 flex-1">
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
            </div>

            {/* SUPER ADMIN OVERRIDE - Adapted to visual language */}
            {isSuperAdmin && (
              <div className="px-6 pb-6 mt-auto">
                <div className="p-4 bg-inverse-surface rounded-xl border border-white/10 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
                    <p className="text-[10px] font-bold text-error uppercase tracking-widest font-body-md">
                      Root Override
                    </p>
                  </div>
                  <button 
                    onClick={() => handleSecureAction('FORCE_DEPROVISION', device.device_id)}
                    className="w-full py-2 bg-error/10 hover:bg-error text-error hover:text-on-error border border-error/20 rounded-lg text-[10px] font-bold tracking-widest transition-all uppercase"
                  >
                    Force Release
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

    </div>
  );
};

export default DeviceCard;
