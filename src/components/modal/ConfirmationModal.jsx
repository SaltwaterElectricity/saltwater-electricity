import { cn } from "../../utils/cn";
import { Info, X, Power } from "lucide-react";
import ModalBackdrop from "./ModalBackdrop";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  variant = "primary",
  children,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <ModalBackdrop>
      <div className="relative w-full max-w-[440px] max-h-[90vh] bg-white/80 backdrop-blur-2xl rounded-[20px] p-8 shadow-2xl border border-white animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {/* HEADER (Left-aligned) */}
        <div className="flex flex-col gap-4 items-start shrink-0 mb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-transform",
              isDanger
                ? "bg-red-600 shadow-lg shadow-red-200"
                : "bg-blue-600 shadow-lg shadow-blue-200"
            )}
          >
            {isDanger ? (
              <Power className="text-white w-8 h-8" />
            ) : (
              <Info className="text-white w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isDanger ? (
              <>
                {title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-red-600">{title.split(" ").slice(-1)}</span>
              </>
            ) : (
              title
            )}
          </h2>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-6">
          <p className="text-slate-500 font-medium leading-relaxed text-left">{description}</p>
          {/* Custom Body (e.g. Warning Highlight) */}
          {children}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 font-bold active:scale-95 rounded-xl disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 px-6 py-3 text-white rounded-xl transition-all active:scale-95 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50",
              isDanger
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            )}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
