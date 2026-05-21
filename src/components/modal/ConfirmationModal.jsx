import { cn } from "../../utils/cn";
import { AlertTriangle, Info, ChevronRight, X } from "lucide-react";
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
  children,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <ModalBackdrop>
      <div className="relative w-[92%] sm:w-full max-w-[440px] bg-white rounded-3xl p-8 shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
        {/* ICON */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto transition-transform hover:scale-110",
          isDanger ? "bg-error-container/20 text-error" : "bg-primary/10 text-primary"
        )}>
          {isDanger ? <AlertTriangle size={32} /> : <Info size={32} />}
        </div>

        {/* HEADER */}
        <h4 className="font-headline-md text-headline-md text-center text-on-surface mb-2 tracking-tight uppercase">
          {title}
        </h4>
        <p className="text-on-surface-variant text-center font-body-md mb-8 leading-relaxed">
          {description}
        </p>

        {/* CUSTOM BODY */}
        {children && (
          <div className="mb-8">
            {children}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors font-semibold border border-outline-variant/30 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 px-6 py-3 text-label-md text-white rounded-xl transition-all active:scale-95 font-semibold shadow-lg flex items-center justify-center gap-2",
              isDanger 
                ? "bg-error hover:bg-red-700 shadow-error/20" 
                : "primary-gradient-btn hover:opacity-90 shadow-primary/20"
            )}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{confirmText}</span>
                {!isDanger && <ChevronRight size={18} />}
              </>
            )}
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-outline hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </ModalBackdrop>
  );
};
