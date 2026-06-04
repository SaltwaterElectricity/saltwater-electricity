import { memo, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Tablet,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { ModalBackdrop, DeclineRequestModal } from "../../modal";

/**
 * ProcessRequestModal Component
 * Redesigned to mirror the 'code2.html' premium detail view.
 * Header and Rounding restored to "normal" (project branding).
 * Footer updated: Cancel button removed, Approve changed to green.
 */
const ProcessRequestModal = memo(
  ({ isOpen, onClose, request, setModalType, isSubmitting, onSubmit }) => {
    const [showDeclineModal, setShowDeclineModal] = useState(false);

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
        minute: "2-digit",
      });
    };

    // Handler to trigger submission directly from buttons
    const handleAction = (type) => {
      if (type === "decline") {
        setShowDeclineModal(true);
      } else {
        setModalType(type);
        // We simulate a form submission event since handleProcessRequest expects one
        onSubmit({ preventDefault: () => {} });
      }
    };

    const handleConfirmDecline = (formData) => {
      // Close local decline modal first
      setShowDeclineModal(false);
      // Then trigger submission with the type and data directly to avoid stale state
      onSubmit(null, "decline", formData);
    };

    return (
      <>
        <ModalBackdrop>
          <div className="bg-surface-container-lowest w-full max-w-[720px] rounded-[20px] linear-shadow overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 sticky top-0 bg-white z-10">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-headline-lg text-xl md:text-2xl text-slate-900 font-extrabold tracking-tight">
                  <span className="text-black">REQUEST</span>{" "}
                  <span className="text-blue-600">DETAILS</span>
                </h2>
                <p className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest">
                  Review and Validate resident device request.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-surface-container-low rounded-full transition-colors active-scale"
              >
                <X className="text-on-surface-variant" size={20} />
              </button>
            </header>

            {/* Body Scroll Area */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Profile Section */}
              <section className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f0eaff] text-[#6200ee] font-bold text-lg"
                    style={{
                      outline: "rgb(0, 102, 255) solid 2px",
                      outlineOffset: "2px",
                    }}
                  >
                    {getInitials(request.residentName)}
                  </div>
                  {/* Name and Email */}
                  <div>
                    <h3 className="font-bold text-base leading-tight text-black">
                      {request.residentName}
                    </h3>
                    <p className="text-[#75849a] text-xs">{request.residentEmail}</p>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="px-3 py-1.5 rounded-lg bg-[#fff2e6] flex items-center gap-1.5">
                  <Clock className="text-[#ff9933]" size={16} />
                  <span className="text-[#ff9933] font-semibold text-xs capitalize">
                    {request.status}
                  </span>
                </div>
              </section>

              {/* Details Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Request Date */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                    <Calendar className="text-primary" size={18} />
                  </div>
                  <div>
                    <label className="block font-label-sm text-[10px] uppercase tracking-wider mb-0.5 text-black">
                      Request Date
                    </label>
                    <span className="text-sm border px-2.5 py-0.5 rounded-lg inline-block mt-0.5 bg-white border-primary text-primary font-medium">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                    <MapPin className="text-primary" size={18} />
                  </div>
                  <div>
                    <label className="block font-label-sm text-[10px] uppercase tracking-wider mb-0.5 text-black">
                      Location
                    </label>
                    <span className="text-sm bg-surface-container-lowest border border-primary px-2.5 py-0.5 rounded-lg inline-block mt-0.5 text-primary font-medium">
                      {request.residentLocation}
                    </span>
                  </div>
                </div>

                {/* Request Type */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                    <Tablet className="text-primary" size={18} />
                  </div>
                  <div>
                    <label className="block font-label-sm text-[10px] uppercase tracking-wider mb-0.5 text-black">
                      Request Type
                    </label>
                    <span className="text-primary text-sm bg-white border border-primary px-2.5 py-0.5 rounded-lg inline-block mt-0.5 font-medium">
                      {request.requestType
                        ?.split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                    <Phone className="text-primary" size={18} />
                  </div>
                  <div>
                    <label className="block font-label-sm text-[10px] uppercase tracking-wider mb-0.5 text-black">
                      Contact Info
                    </label>
                    <span className="text-primary text-sm bg-white border border-primary px-2.5 py-0.5 rounded-lg inline-block mt-0.5 font-medium">
                      {request.residentMobile}
                    </span>
                  </div>
                </div>
              </section>

              {/* Message Box */}
              <section className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center shrink-0">
                    <MessageSquare className="text-primary" size={18} />
                  </div>
                  <label className="font-label-sm text-[10px] uppercase tracking-wider text-black">
                    Message
                  </label>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-3.5 mt-2">
                  <p className="text-on-surface font-body-md text-sm italic leading-relaxed">
                    &quot;{request.message}&quot;
                  </p>
                </div>
              </section>
            </div>

            {/* Action Footer */}
            <footer className="px-6 py-4 bg-surface-container/30 border-t border-outline-variant/30 flex items-center justify-end sticky bottom-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAction("decline")}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 bg-[#ef4444] text-white text-sm font-semibold rounded-lg hover:brightness-105 shadow-md transition-all active-scale disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 shadow-md transition-all active-scale disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      <span>Approve</span>
                    </button>
                  </>
                )}
              </div>
            </footer>
          </div>
        </ModalBackdrop>

        <DeclineRequestModal
          isOpen={showDeclineModal}
          onClose={() => setShowDeclineModal(false)}
          request={request}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmDecline}
        />
      </>
    );
  }
);

ProcessRequestModal.displayName = "ProcessRequestModal";

export default ProcessRequestModal;
