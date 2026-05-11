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
  icon = null,
  children,
}) => {
  if (!isOpen) return null;

  // Resolve default icon based on variant if none provided
  const displayIcon = icon || (variant === "danger" ? "logout" : "info");

  return (
    <ModalBackdrop>
      <div className="glass-panel w-[92%] sm:w-full max-w-[440px] rounded-[32px] shadow-[0_40px_80px_rgba(0,82,204,0.12)] overflow-hidden animate-zoomIn flex flex-col border border-white/40">
        {/* HEADER */}
        <div className="bg-surface-container-low/50 p-8 border-b border-outline-variant/20 text-center backdrop-blur-md">
          <h2 className="text-xl font-black text-on-surface tracking-tight uppercase font-display italic">
            {title}
          </h2>
          <p className="text-[11px] font-semibold text-outline uppercase tracking-[0.12em] mt-3 font-body-md leading-relaxed">
            {description}
          </p>
        </div>

        {/* BODY */}
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-6 font-body-md text-on-surface-variant">
          {children || (
            <div className="flex items-center justify-center p-4">
              <div
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center shadow-inner border border-white/40",
                  variant === "danger" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[40px]">{displayIcon}</span>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-surface-container-low/50 flex gap-4 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.1em] text-outline hover:text-on-surface hover:bg-white/40 transition-all disabled:opacity-50 font-body-md border border-outline-variant/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-[2] px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-body-md",
              variant === "danger"
                ? "bg-error hover:bg-error/90 shadow-error/20"
                : "ocean-gradient hover:opacity-90 shadow-primary/20"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <span>{confirmText}</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
