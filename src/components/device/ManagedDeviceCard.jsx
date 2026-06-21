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
      "group border rounded-[24px] p-6 shadow-sm transition-all duration-500 min-w-[300px] flex flex-col justify-between h-full backdrop-blur-md",
      isAvailable 
        ? "bg-white border-slate-100 hover:shadow-xl hover:border-blue-100" 
        : "bg-slate-50/50 border-slate-200 opacity-90"
    )}>
      
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-widest",
            isAvailable ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          )}>
            {isAvailable ? <CheckCircle2 size={10} /> : <Lock size={10} />}
            {device.availability?.toUpperCase() || 'UNKNOWN'}
          </div>
          <p className="text-[12px] text-slate-300 font-mono bg-slate-100/50 px-2 py-0.5 rounded">
            #{device.device_id}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0",
            isAvailable 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
              : "bg-amber-100 text-amber-600 shadow-inner"
          )}>
            <Cpu size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight truncate">
              {device.device_name || "Unnamed Node"}
            </h3>
            {!isAvailable && (
              <p className="text-[12px] font-bold text-blue-500 uppercase tracking-tighter mt-1">
                Currently Deployed
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-8 border-y border-slate-100 py-6"> 
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
            "flex-1 h-14 rounded-2xl font-black text-[12px] tracking-[0.2em] transition-all duration-300 uppercase shrink-0",
            isAvailable
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.95] shadow-lg shadow-blue-100"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/30"
          )}
        >
          {isAvailable ? 'ASSIGN DEVICE' : 'LOCKED BY END-USER'}
        </button>

        {isAdmin && !isAvailable && (
          <button
            onClick={() => onForceRelease(device.device_id)}
            className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all border border-red-200/50"
            title="Force Release Device"
          >
            <Lock size={20} />
          </button>
        )}
      </div>
    </article>
  );
};