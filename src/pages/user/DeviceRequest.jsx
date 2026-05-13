import { useState, useMemo, useCallback } from "react";
import { Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests } from "../../hooks";
import { 
  DeviceRequestModal,
  Toast
} from "../../components";
import { cn } from "../../utils/cn";

/**
 * DeviceRequest Page
 * Allows residents to request new hardware monitoring units.
 * Adheres to AlonKuryente visual language and 8-point grid.
 */
const DeviceRequest = () => {
  const { user } = useAuth();
  const { requests, loading, error } = useDeviceRequests(user?.uid);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastConfig, setToastConfig] = useState({ isOpen: false, message: "", type: "success" });

  const hasPendingRequest = useMemo(() => {
    return requests.some((req) => req.status === "pending");
  }, [requests]);

  const triggerToast = useCallback((message, type = "success") => {
    setToastConfig({ isOpen: true, message, type });
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "declined":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-margin animate-in fade-in duration-700 antialiased text-on-surface">
      <Toast 
        isOpen={toastConfig.isOpen || !!error} 
        message={error?.message || toastConfig.message} 
        type={error ? "error" : toastConfig.type} 
        onClose={() => setToastConfig(prev => ({ ...prev, isOpen: false }))} 
      />

      <DeviceRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onShowToast={triggerToast}
      />

      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase font-display">
            Device <span className="text-primary">Provisioning</span>
          </h1>
          <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em] font-body-md">
            Manage your hardware fleet and installation requests
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={hasPendingRequest}
          className={cn(
            "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl",
            hasPendingRequest
              ? "bg-surface-container-highest text-outline cursor-not-allowed shadow-none"
              : "ocean-gradient text-white shadow-primary/20 hover:opacity-90"
          )}
        >
          <Plus size={18} />
          Request New Device
        </button>
      </header>

      {/* STATUS BANNER */}
      {hasPendingRequest && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
             <Clock size={20} />
          </div>
          <p className="text-xs md:text-sm font-bold text-amber-800 leading-relaxed font-body-md">
            Transmission Pending: Our technical team is reviewing your latest hardware request. 
            Multiple active requests are throttled to ensure grid integrity.
          </p>
        </div>
      )}

      {/* TABLE SECTION */}
      <section className="glass-panel rounded-[32px] border border-white/40 shadow-sm overflow-hidden transition-all hover:bg-white/80">
        <div className="p-8 border-b border-outline-variant/10 bg-white/30">
           <h3 className="text-sm font-black text-on-surface uppercase tracking-widest font-display">Recent Activity</h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-low/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-outline font-body-md">
                  Reference ID
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-outline font-body-md">
                  Submission Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-outline font-body-md">
                  Device Metadata
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-outline font-body-md">
                  Current Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-outline uppercase tracking-widest font-body-md">
                        Synchronizing Request Archive...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <XCircle size={40} className="text-outline" />
                      <p className="text-sm font-bold text-outline uppercase tracking-widest italic font-body-md">
                        No hardware records found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-mono font-black text-primary bg-primary/5 px-2 py-1 rounded-md">
                        #{req.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-on-surface font-body-md">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-on-surface font-display">{req.deviceName}</p>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-tight mt-1 font-body-md">
                        {req.requestType.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                          getStatusStyle(req.status)
                        )}
                      >
                        {req.status === "pending" && <Clock size={12} className="animate-pulse" />}
                        {req.status === "approved" && <CheckCircle2 size={12} />}
                        {req.status === "declined" && <XCircle size={12} />}
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DeviceRequest;

