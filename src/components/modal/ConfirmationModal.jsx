import { cn } from "../../utils/cn";
import ModalBackdrop from "./ModalBackdrop";

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  variant = "primary", // primary (blue), danger (red), etc.
  children 
}) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">

        {/* HEADER */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none italic">{title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{description}</p>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-[2] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
              variant === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};