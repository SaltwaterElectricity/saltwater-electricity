import { useState, memo } from "react";
import { X, AlertTriangle, ChevronDown } from "lucide-react";
import ModalBackdrop from "./ModalBackdrop";
import { cn } from "../../utils/cn";

/**
 * CancelRequestModal Component
 * Industry-standard cancellation workflow with reason selection and feedback.
 * Adheres to the 8pt grid and AlonKuryente visual style.
 */
const CancelRequestModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setReason("");
    setFeedback("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;
    onConfirm({ reason, feedback });
  };

  const CANCEL_REASONS = [
    "Accidental Request",
    "Change of Mind",
    "Specification Error",
    "Found Alternative",
    "Installation No Longer Required",
    "Other (Please specify below)",
  ];

  return (
    <ModalBackdrop>
      <div className="bg-white rounded-[32px] shadow-2xl w-[92%] sm:w-full max-w-[480px] overflow-hidden animate-zoomIn border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error shadow-inner shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic font-display">
                Cancel <span className="text-error">Request</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 font-body-md">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 font-body-md">
              Primary Reason for Cancellation
            </label>
            <div className="relative">
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-error/20 focus:bg-white transition-all appearance-none font-body-md"
              >
                <option value="" disabled>
                  Select a reason...
                </option>
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Feedback Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 font-body-md">
              Additional Feedback (Optional)
            </label>
            <textarea
              placeholder="Help us improve our service by providing more details..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-error/20 focus:bg-white transition-all font-body-md resize-none"
            />
          </div>

          {/* Warning Notice */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[10px] text-amber-700 leading-relaxed italic">
              * Note: Once cancelled, the request record will be moved to the archive and cannot be
              reactivated.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-50 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-[10px] tracking-widest uppercase font-body-md"
            >
              KEEP REQUEST
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className={cn(
                "flex-[1.5] h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase flex items-center justify-center gap-2 font-body-md shadow-lg",
                reason && !isSubmitting
                  ? "bg-error text-white shadow-error/20 hover:bg-red-700 active:scale-95"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "CONFIRM CANCELLATION"
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export default memo(CancelRequestModal);
