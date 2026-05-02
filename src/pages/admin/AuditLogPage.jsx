import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  Edit3, 
  Info, 
  Calendar,
  User,
  Activity,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useAuditLogs } from "../../hooks";
import { deleteAuditLog } from "../../services/audit.service";
import { cn } from "../../utils/cn";
import { ConfirmationModal } from "../../components/modal/ConfirmationModal";
import Toast from "../../components/ui/Toast";

/**
 * AuditLogPage Component
 * High-fidelity security monitor for Saltwater Electricity operations.
 * Restricted to Admin and SuperAdmin roles.
 */
const AuditLogPage = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const { logs, loading } = useAuditLogs(200); // Fetch last 200 for better auditing

  // --- UI STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FILTERING LOGIC (Requirement 4) ---
  const filteredLogs = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    if (!cleanSearch) return logs;

    return logs.filter(log => 
      log.adminEmail?.toLowerCase().includes(cleanSearch) ||
      log.action?.toLowerCase().includes(cleanSearch) ||
      log.details?.toLowerCase().includes(cleanSearch)
    );
  }, [logs, searchTerm]);

  // --- ACCESS CONTROL (Requirement 1) ---
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="max-w-md p-12 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/60 shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            403 <span className="text-red-600">Forbidden</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Unauthorized Access: This security terminal is restricted to <span className="font-black text-slate-900 uppercase">System Administrators</span>.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all active:scale-95 shadow-lg"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  // --- HANDLERS ---
  const triggerToast = (message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedLogId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLogId) return;
    setIsDeleting(true);
    try {
      await deleteAuditLog(selectedLogId);
      triggerToast("Security log entry purged successfully.");
    } catch (err) {
      triggerToast(err.message || "Failed to delete log.", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedLogId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto antialiased">
      <Toast 
        isOpen={showToast} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setShowToast(false)} 
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Purge Security Log"
        description="Are you sure you want to permanently remove this entry? This action is irreversible and affects the system's accountability trail."
        confirmText="Confirm Purge"
        variant="danger"
        isSubmitting={isDeleting}
      />

      {/* HEADER SECTION (8-point grid, tracking-[0.2em]) */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 w-full xl:w-auto">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              System <span className="text-blue-600">Audit</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              Operations <ChevronRight size={10} /> Accountability Terminal
            </p>
          </div>
        </div>

        <div className="w-full xl:w-96 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Admin Email or Action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl text-xs font-bold tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </header>

      {/* GLASSMORPHIC TABLE (Requirement 2 & 5) */}
      <main className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/60 shadow-sm overflow-hidden transition-all hover:bg-white/50">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/40 bg-slate-900/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin Email</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Logs...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] italic">No security records found.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/40 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-slate-400" />
                        <div>
                          <p className="text-[11px] font-black text-slate-900 leading-none">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <User size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700">{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        log.action?.includes('delete') || log.action?.includes('disable') 
                          ? "bg-red-50 text-red-600 border-red-100" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-mono font-bold text-slate-500">#{log.targetId?.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] font-medium text-slate-600 truncate max-w-xs">{log.details}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {/* Requirement 3: Conditional Rendering by Role */}
                        {isSuperAdmin ? (
                          <>
                            <button 
                              className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all active:scale-90 shadow-lg shadow-slate-900/10"
                              title="Edit Entry"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(log.id)}
                              className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all active:scale-90 shadow-lg shadow-red-900/10"
                              title="Purge Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-white hover:text-blue-600 transition-all active:scale-95 font-black text-[9px] uppercase tracking-widest border border-slate-200/50"
                          >
                            <Info size={14} /> View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* FOOTER METRICS */}
      <footer className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard label="Total Events" value={logs.length} icon={Activity} />
        <MetricCard label="Filtered Results" value={filteredLogs.length} icon={Search} color="blue" />
        <MetricCard label="Last Pulse" value={logs[0] ? new Date(logs[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"} icon={Calendar} color="emerald" />
      </footer>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color = "slate" }) => (
  <div className="p-6 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-sm flex items-center gap-6 group hover:bg-white/60 transition-all">
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform",
      color === "blue" ? "bg-blue-600 text-white shadow-blue-900/10" : 
      color === "emerald" ? "bg-emerald-500 text-white shadow-emerald-900/10" : "bg-slate-900 text-white shadow-slate-900/10"
    )}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default AuditLogPage;
