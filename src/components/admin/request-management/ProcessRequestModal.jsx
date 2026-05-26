import { memo } from "react";
import { 
  X, 
  Calendar, 
  MapPin, 
  Tablet, 
  Phone, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { ModalBackdrop } from "../../modal";

/**
 * ProcessRequestModal Component
 * Redesigned to mirror the 'code2.html' premium detail view.
 * Header and Rounding restored to "normal" (project branding).
 * Footer updated: Cancel button removed, Approve changed to green.
 */
const ProcessRequestModal = memo(
  ({
    isOpen,
    onClose,
    request,
    setModalType,
    isSubmitting,
    onSubmit,
  }) => {
    if (!isOpen || !request) return null;

    const getInitials = (name) => {
      if (!name) return "??";
      const parts = name.split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };

    // Handler to trigger submission directly from buttons
    const handleAction = (type) => {
      setModalType(type);
      // We simulate a form submission event since handleProcessRequest expects one
      onSubmit({ preventDefault: () => {} });
    };

    return (
      <ModalBackdrop>
        <div className="bg-surface-container-lowest w-full max-w-[850px] rounded-[20px] linear-shadow overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
          {/* Header */}
          <header className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30 sticky top-0 bg-white z-10">
            <div className="flex flex-col gap-1">
              <h2 className="font-headline-lg text-2xl md:text-3xl text-slate-900 font-extrabold tracking-tight">
                <span className="text-black">REQUEST</span> <span className="text-blue-600">DETAILS</span>
              </h2>
              <p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
                Review and Validate resident device request.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-container-low rounded-full transition-colors active-scale"
            >
              <X className="text-on-surface-variant" size={24} />
            </button>
          </header>

          {/* Body Scroll Area */}
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Profile Section */}
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-[#f0eaff] text-[#6200ee] font-bold text-xl"
                  style={{ outline: "rgb(0, 102, 255) solid 2px", outlineOffset: "2px" }}
                >
                  {getInitials(request.residentName)}
                </div>
                {/* Name and Email */}
                <div>
                  <h3 className="font-bold text-lg leading-tight text-black">
                    {request.residentName}
                  </h3>
                  <p className="text-[#75849a] text-sm">
                    {request.residentEmail}
                  </p>
                </div>
              </div>
              {/* Status Badge */}
              <div className="px-4 py-2 rounded-xl bg-[#fff2e6] flex items-center gap-2">
                <Clock className="text-[#ff9933]" size={20} />
                <span className="text-[#ff9933] font-semibold text-sm capitalize">{request.status}</span>
              </div>
            </section>

            {/* Details Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Request Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider mb-0.5 text-black">
                    Request Date
                  </label>
                  <span className="text-body-md border px-3 py-1 rounded-lg inline-block mt-1 bg-white border-primary text-primary font-medium">
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider mb-0.5 text-black">
                    Location
                  </label>
                  <span className="text-body-md bg-surface-container-lowest border border-primary px-3 py-1 rounded-lg inline-block mt-1 text-primary font-medium">
                    {request.residentLocation}
                  </span>
                </div>
              </div>

              {/* Request Type */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <Tablet className="text-primary" size={20} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider mb-0.5 text-black">
                    Request Type
                  </label>
                  <span className="text-primary text-body-md bg-white border border-primary px-3 py-1 rounded-lg inline-block mt-1 font-medium">
                    {request.requestType?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider mb-0.5 text-black">
                    Contact Info
                  </label>
                  <span className="text-primary text-body-md bg-white border border-primary px-3 py-1 rounded-lg inline-block mt-1 font-medium">
                    {request.residentMobile}
                  </span>
                </div>
              </div>
            </section>

            {/* Message Box */}
            <section className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                  <MessageSquare className="text-primary" size={20} />
                </div>
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-black">
                  Message
                </label>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-4 mt-2">
                <p className="text-on-surface font-body-md text-body-md italic">
                  &quot;{request.message}&quot;
                </p>
              </div>
            </section>
          </div>

          {/* Action Footer */}
          <footer className="px-8 py-6 bg-surface-container/30 border-t border-outline-variant/30 flex items-center justify-end sticky bottom-0 bg-white z-10">
            <div className="flex items-center gap-3">
              {request.status === "pending" && (
                <>
                  <button 
                    onClick={() => handleAction("decline")}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#ef4444] text-white font-medium rounded-lg hover:brightness-105 shadow-md transition-all active-scale disabled:opacity-50"
                  >
                    <XCircle size={20} className="font-bold" />
                    <span>Decline</span>
                  </button>
                  <button 
                    onClick={() => handleAction("approve")}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:opacity-90 shadow-md transition-all active-scale disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} className="font-bold" />
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>
          </footer>
        </div>
      </ModalBackdrop>
    );
  }
);

ProcessRequestModal.displayName = "ProcessRequestModal";

export default ProcessRequestModal;
