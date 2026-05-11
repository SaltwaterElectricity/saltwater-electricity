import { Cpu, Globe, Calendar, CheckCircle2, Lock, User, MapPin } from 'lucide-react';
import { cn } from "../../utils/cn";
import { DeviceInfoRow } from './DeviceInfoRow';
import { useAssignmentDetails } from '../../hooks/useAssignmentDetails';

export const ManagedDeviceCard = ({ device, onAssignClick, onForceRelease, isAdmin }) => {
  const isAvailable = device.availability === 'available';

  const { fullName, address, assignedAt, loading } = useAssignmentDetails(device.device_id);

  const formatAddress = (addr) => {
    if (!addr) return "No Address Provided";
    if (typeof addr === 'string') return addr;
    
    const parts = [
      addr.street,
      addr.baranggay,
      addr.cityProvince,
      addr.zipCode
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : "Invalid Address Format";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <article className={cn(
      "glass-panel rounded-[20px] p-6 overflow-hidden transition-all duration-500 min-w-[300px] flex flex-col justify-between h-full group",
      !isAvailable && "opacity-90"
    )}>
      
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-body-md",
            isAvailable ? "bg-tertiary-fixed-dim/20 text-tertiary" : "bg-primary-container/10 text-primary"
          )}>
            {isAvailable ? <CheckCircle2 size={10} /> : <Lock size={10} />}
            {device.availability?.toUpperCase() || 'UNKNOWN'}
          </div>
          <p className="text-[10px] text-outline font-mono bg-surface-container-low px-2 py-0.5 rounded">
            #{device.device_id}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 shadow-lg",
            isAvailable 
              ? "ocean-gradient text-white shadow-blue-500/20" 
              : "bg-surface-container-high text-outline"
          )}>
            <Cpu size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-h2 text-xl font-bold text-on-surface leading-tight tracking-tight truncate">
              {device.device_name || "Unnamed Node"}
            </h3>
            {!isAvailable && (
              <p className="text-[11px] font-bold text-primary uppercase tracking-tighter mt-1 font-body-md">
                Currently Deployed
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-8 border-y border-outline-variant/30 py-6"> 
          {isAvailable ? (
            <>
              <DeviceInfoRow 
                label="IP Address" 
                value={device.ip_address || '0.0.0.0'} 
                icon={Globe} 
                isMono 
              />
              <DeviceInfoRow 
                label="System Start" 
                value={formatDate(device.created_at)} 
                icon={Calendar} 
              />
            </>
          ) : (
            <>
              <DeviceInfoRow 
                label="Assigned To" 
                value={loading ? "Fetching..." : fullName} 
                icon={User} 
                variant="highlight"
              />
              <DeviceInfoRow 
                label="Location" 
                value={loading ? "Locating..." : formatAddress(address)} 
                icon={MapPin} 
              />
              <DeviceInfoRow 
                label="Deployed On" 
                value={loading ? "..." : formatDate(assignedAt)} 
                icon={Calendar} 
              />
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => isAvailable && onAssignClick(device)}
          disabled={!isAvailable && !isAdmin}
          className={cn(
            "flex-1 h-14 rounded-2xl font-bold text-xs tracking-widest transition-all duration-300 uppercase shrink-0",
            isAvailable
              ? "ocean-gradient text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-blue-500/20"
              : "bg-surface-container-highest text-outline cursor-not-allowed border border-outline-variant/30"
          )}
        >
          {isAvailable ? 'ASSIGN DEVICE' : 'LOCKED BY END-USER'}
        </button>

        {isAdmin && !isAvailable && (
          <button
            onClick={() => onForceRelease(device.device_id)}
            className="h-14 w-14 flex items-center justify-center rounded-2xl bg-error/10 text-error hover:bg-error hover:text-on-error transition-all border border-error/20 shadow-lg shadow-error/10"
            title="Force Release Device"
          >
            <Lock size={20} />
          </button>
        )}
      </div>
    </article>
  );
};
