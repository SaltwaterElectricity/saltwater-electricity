import { memo, useState } from "react";
import { X, XCircle } from "lucide-react";
import ModalBackdrop from "./ModalBackdrop";
import { cn } from "../../utils/cn";

/**
 * DeclineRequestModal Component
 * Implements the "Request Denied!" design from 'code1.html'.
 * Used by admins to provide a reason for declining a device request.
 */
const DeclineRequestModal = ({ isOpen, onClose, onConfirm, isSubmitting, request }) => {
  const [reason, setReason] = useState("");

  if (!isOpen || !request) return null;

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm({ reason: reason.trim() });
  };

  return (
    <ModalBackdrop>
      <div className="bg-surface-container-lowest w-full max-w-[420px] rounded-[24px] linear-shadow overflow-hidden transform transition-all duration-300 flex flex-col animate-in fade-in zoom-in">
        <div className="p-6">
          {/* Top Icon: Circular Decline */}
          <div className="mb-4 flex">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-error-container/30 border border-error/20 shadow-sm">
              <X className="text-error" size={28} strokeWidth={3} />
            </div>
          </div>

          {/* Title & Context */}
          <div className="space-y-1 mb-6">
            <h3 className="text-xl text-on-background font-bold">
              Request <span className="text-error italic font-black">Denied!</span>
            </h3>
            <div className="flex items-center gap-2 py-1 px-2.5 bg-error-container/20 rounded-full w-fit border border-error/10">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                Resident:
              </span>
              <span className="text-[9px] font-black text-on-surface uppercase">
                {request.residentName}
              </span>
            </div>
          </div>

          {/* Text Box: Reason for Decline */}
          <div className="space-y-2.5">
            <label
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1"
              htmlFor="decline-reason"
            >
              Reason for Decline
            </label>
            <textarea
              id="decline-reason"
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 text-sm font-medium text-on-surface focus:ring-2 focus:ring-error/20 focus:border-error transition-all outline-none resize-none placeholder:text-outline/50 font-body-sm"
              placeholder="Please provide a justification for declining this electricity monitoring access request..."
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Footer: Actions */}
        <div className="px-6 pb-8 flex gap-3 items-center justify-center">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-5 bg-white border border-outline-variant/30 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-low transition-all duration-200 active:scale-[0.98] rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className={cn(
              "flex-1 py-3 px-5 text-on-error font-bold text-[10px] uppercase tracking-widest shadow-lg transition-all duration-200 active:scale-[0.98] rounded-xl flex items-center justify-center gap-2",
              reason.trim() && !isSubmitting
                ? "bg-error shadow-error/20 hover:brightness-110"
                : "bg-surface-container-high text-outline cursor-not-allowed shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <XCircle size={16} />
                <span>Decline Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default memo(DeclineRequestModal);
