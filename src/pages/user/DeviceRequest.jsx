import { useState, useMemo } from 'react';
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests } from "../../hooks";
import { createDeviceRequest } from "../../services/request.service";
import { ModalBackdrop } from "../../components/modal";
import { cn } from "../../utils/cn";

/**
 * DeviceRequest Page
 * Allows residents to request new hardware monitoring units.
 */
const DeviceRequest = () => {
  const { user } = useAuth();
  const { requests, loading } = useDeviceRequests(user?.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ deviceName: '', requestType: 'new_installation' });

  const hasPendingRequest = useMemo(() => {
    return requests.some(req => req.status === 'pending');
  }, [requests]);

  const handleOpenModal = () => {
    if (hasPendingRequest) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ deviceName: '', requestType: 'new_installation' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createDeviceRequest(user.uid, formData);
      handleCloseModal();
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return "bg-amber-50 text-amber-600 border-amber-100";
      case 'approved':
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case 'declined':
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8 antialiased text-slate-900">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter">
            Device <span className="text-blue-600">Requests</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Manage your hardware provisioning
          </p>
        </div>
        
        <button 
          onClick={handleOpenModal}
          disabled={hasPendingRequest}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/10",
            hasPendingRequest 
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <Plus size={16} />
          Request New Device
        </button>
      </header>

      {/* WARNING FOR PENDING */}
      {hasPendingRequest && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <Clock className="text-amber-500 shrink-0" size={20} />
          <p className="text-[11px] font-bold text-amber-800 leading-tight">
            You currently have a pending request. Please wait for an administrator to review your request before submitting a new one.
          </p>
        </div>
      )}

      {/* TABLE SECTION */}
      <section className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-sm overflow-hidden transition-all hover:bg-white/80">
        <div className="overflow-x-auto custom-scrollbar overflow-y-hidden">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Request ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Device Name</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Requests...</p>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">No requests found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{req.id.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-900">{req.deviceName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{req.requestType.replace('_', ' ')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
                        getStatusStyle(req.status)
                      )}>
                        {req.status === 'pending' && <Clock size={10} />}
                        {req.status === 'approved' && <CheckCircle2 size={10} />}
                        {req.status === 'declined' && <XCircle size={10} />}
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

      {/* FORM MODAL */}
      {isModalOpen && (
        <ModalBackdrop>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 md:p-10 animate-in zoom-in-95 duration-300">
            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-black italic tracking-tighter">
                Request <span className="text-blue-600">Unit</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Specify your hardware needs
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Device Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Kitchen Monitor"
                  value={formData.deviceName}
                  onChange={(e) => setFormData({...formData, deviceName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Request Type</label>
                <select 
                  value={formData.requestType}
                  onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all appearance-none"
                >
                  <option value="new_installation">New Installation</option>
                  <option value="replacement">Device Replacement</option>
                  <option value="upgrade">Hardware Upgrade</option>
                </select>
              </div>

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
                  className="flex-2 py-4 rounded-2xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-900/10"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
};

export default DeviceRequest;
