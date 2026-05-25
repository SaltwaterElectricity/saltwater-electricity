import { memo } from "react";
import { Settings, AlertCircle } from "lucide-react";
import { ModalBackdrop } from "../../modal";
import { cn } from "../../../utils/cn";

/**
 * ProcessRequestModal Component
 * Modal for approving or declining a device request.
 */
const ProcessRequestModal = memo(
  ({
    isOpen,
    onClose,
    request,
    modalType,
    setModalType,
    isSubmitting,
    onSubmit,
    approveForm,
    setApproveForm,
    declineForm,
    setDeclineForm,
  }) => {
    if (!isOpen || !request) return null;

    return (
      <ModalBackdrop>
        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 md:p-10 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300",
                modalType === "approve"
                  ? "bg-emerald-500 shadow-emerald-900/20"
                  : "bg-rose-500 shadow-rose-900/20"
              )}
            >
              {modalType === "approve" ? <Settings size={22} /> : <AlertCircle size={22} />}
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-black italic tracking-tighter uppercase">
                {modalType} <span className="text-slate-900 text-opacity-40">Request</span>
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Resident: {request.residentName}
              </p>
            </div>
            
            {/* ACTION TOGGLE (Only if pending) */}
            {request.status === "pending" && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setModalType("approve")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    modalType === "approve" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("decline")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    modalType === "decline" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Decline
                </button>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {modalType === "approve" ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Device ID (Hardware ID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., UNIT_402"
                    value={approveForm.deviceId}
                    onChange={(e) =>
                      setApproveForm({ ...approveForm, deviceId: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Assignment Identifier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ASSIGN_2026_01"
                    value={approveForm.deviceAssignId}
                    onChange={(e) =>
                      setApproveForm({
                        ...approveForm,
                        deviceAssignId: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Reason for Decline
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Provide a brief explanation..."
                  value={declineForm.reason}
                  onChange={(e) => setDeclineForm({ ...declineForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all resize-none"
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "flex-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl",
                  modalType === "approve"
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/10"
                    : "bg-rose-500 hover:bg-rose-600 shadow-rose-900/10"
                )}
              >
                {isSubmitting ? "Syncing..." : `Confirm ${modalType}`}
              </button>
            </div>
          </form>
        </div>
      </ModalBackdrop>
    );
  }
);

ProcessRequestModal.displayName = "ProcessRequestModal";

export default ProcessRequestModal;
