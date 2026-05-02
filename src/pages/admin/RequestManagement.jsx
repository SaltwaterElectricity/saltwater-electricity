import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Settings,
  AlertCircle,
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests, useUserSubscription } from "../../hooks";
import { ROLES } from "../../constants/roles";
import { updateRequestStatus } from "../../services/request.service";
import { ModalBackdrop } from "../../components/modal";
import { cn } from "../../utils/cn";
import Toast from "../../components/ui/Toast";

/**
 * RequestManagement Page
 * Admin/SuperAdmin view to manage device requests from residents.
 */
const RequestManagement = () => {
  const { user: adminUser } = useAuth();
  const { requests, loading: requestsLoading } = useDeviceRequests();
  const { data: users, loading: usersLoading } = useUserSubscription(ROLES.RESIDENT);


  // TOAST STATE
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  // MODAL STATES
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' or 'decline'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FORM STATES
  const [approveForm, setApproveForm] = useState({ deviceId: '', deviceAssignId: '' });
  const [declineForm, setDeclineForm] = useState({ reason: '' });

  // HYDRATION: Map userId to Name
  const hydratedRequests = useMemo(() => {
    if (!requests || !users) return [];
    return requests.map(req => {
      const resident = users.find(u => u.id === req.userId);
      return {
        ...req,
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Unknown Resident"
      };
    });
  }, [requests, users]);

  const triggerToast = (message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  const handleOpenModal = (req, type) => {
    setSelectedRequest(req);
    setModalType(type);
    if (type === 'approve') {
        setApproveForm({ deviceId: '', deviceAssignId: '' });
    } else {
        setDeclineForm({ reason: '' });
    }
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalType(null);
  };

  const handleProcessRequest = async (e) => {
    e.preventDefault();
    if (isSubmitting || !selectedRequest) return;

    setIsSubmitting(true);
    try {
      const extraData = modalType === 'approve' 
        ? { ...approveForm, adminId: adminUser.uid }
        : { ...declineForm, adminId: adminUser.uid };

      await updateRequestStatus(selectedRequest.id, modalType === 'approved' ? 'approved' : modalType + 'd', extraData);
      
      triggerToast(`Request ${modalType}d successfully.`);
      handleCloseModal();
    } catch (err) {
      triggerToast(err.message || "Failed to process request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return "bg-amber-50 text-amber-600 border-amber-100";
      case 'approved': return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'declined': return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto antialiased">
      <Toast 
        isOpen={showToast} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setShowToast(false)} 
      />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-900/20">
                <ClipboardList size={28} />
            </div>
            <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase italic">
                    Request <span className="text-blue-600">Hub</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    System Operations <ChevronRight size={10} /> Device Provisioning
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feed Active</span>
            </div>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatItem 
            label="Total Requests" 
            value={hydratedRequests.length} 
            icon={ClipboardList} 
            color="blue" 
        />
        <StatItem 
            label="Pending Review" 
            value={hydratedRequests.filter(r => r.status === 'pending').length} 
            icon={Clock} 
            color="amber" 
        />
        <StatItem 
            label="Resolution Rate" 
            value={hydratedRequests.length ? Math.round((hydratedRequests.filter(r => r.status !== 'pending').length / hydratedRequests.length) * 100) : 0} 
            unit="%"
            icon={CheckCircle2} 
            color="emerald" 
        />
      </section>

      {/* MAIN TABLE CONTAINER - GLASSMORPHISM */}
      <main className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-sm overflow-hidden transition-all hover:bg-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Resident Info</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Device Spec</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requestsLoading || usersLoading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Operation Data...</p>
                    </div>
                  </td>
                </tr>
              ) : hydratedRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase italic tracking-widest">No requests currently in queue.</p>
                  </td>
                </tr>
              ) : (
                hydratedRequests.map((req) => (
                  <tr key={req.id} className="group hover:bg-white transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{req.residentName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">UID: {req.userId.substring(0, 10)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-700 leading-none mb-1">{req.deviceName}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{req.requestType?.replace('_', ' ')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
                        getStatusStyle(req.status)
                      )}>
                        {req.status === 'pending' && <Clock size={10} />}
                        {req.status === 'approved' && <CheckCircle2 size={10} />}
                        {req.status === 'declined' && <XCircle size={10} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleOpenModal(req, 'approve')}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleOpenModal(req, 'decline')}
                              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-900/10"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-300">
                             <CheckCircle2 size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Resolved</span>
                          </div>
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

      {/* MODALS */}
      {modalType && (
        <ModalBackdrop>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 md:p-10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl",
                    modalType === 'approve' ? "bg-emerald-500 shadow-emerald-900/20" : "bg-rose-500 shadow-rose-900/20"
                )}>
                    {modalType === 'approve' ? <Settings size={22} /> : <AlertCircle size={22} />}
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-black italic tracking-tighter uppercase">
                        {modalType} <span className="text-slate-900 text-opacity-40">Request</span>
                    </h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Resident: {selectedRequest?.residentName}
                    </p>
                </div>
            </div>

            <form onSubmit={handleProcessRequest} className="space-y-6">
              {modalType === 'approve' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Device ID (Hardware ID)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., UNIT_402"
                      value={approveForm.deviceId}
                      onChange={(e) => setApproveForm({...approveForm, deviceId: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assignment Identifier</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., ASSIGN_2026_01"
                      value={approveForm.deviceAssignId}
                      onChange={(e) => setApproveForm({...approveForm, deviceAssignId: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reason for Decline</label>
                  <textarea 
                    required
                    rows="3"
                    placeholder="Provide a brief explanation..."
                    value={declineForm.reason}
                    onChange={(e) => setDeclineForm({...declineForm, reason: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all resize-none"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl",
                    modalType === 'approve' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/10" : "bg-rose-500 hover:bg-rose-600 shadow-rose-900/10"
                  )}
                >
                  {isSubmitting ? "Syncing..." : `Confirm ${modalType}`}
                </button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
};

const StatItem = ({ label, value, unit, icon: Icon, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", colors[color])}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 tabular-nums">
                    {value}<span className="text-xs ml-1 text-slate-400 font-bold">{unit}</span>
                </p>
            </div>
        </div>
    );
};

export default RequestManagement;
