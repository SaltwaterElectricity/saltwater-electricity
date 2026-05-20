import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests } from "../../hooks";
import { CancelRequestModal, Toast } from "../../components";
import { cancelDeviceRequest } from "../../services/request.service";
import { getRemainingCancellationTime, formatCountdown } from "../../utils/timeUtils";
import { cn } from "../../utils/cn";

/**
 * RequestAction Component
 * Handles the industry-standard cancellation lifecycle with live countdown.
 */
const RequestAction = ({ request, onCancelTrigger }) => {
  const [timeLeft, setTimeLeft] = useState(getRemainingCancellationTime(request.createdAt));
  const isPending = request.status === "pending";

  useEffect(() => {
    if (!isPending || timeLeft <= 0) return;

    const timer = setInterval(() => {
      const remaining = getRemainingCancellationTime(request.createdAt);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [request.createdAt, isPending, timeLeft]);

  // Logic: Show Cancel only if Pending and window is active
  if (isPending && timeLeft > 0) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onCancelTrigger(request)}
          className="px-4 py-1.5 bg-error/10 text-error border border-error/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          Cancel Request
        </button>
        <div className="flex items-center gap-1.5 text-outline opacity-70">
          <Timer size={10} className="animate-pulse" />
          <span className="text-[9px] font-mono font-bold tracking-tight">
            Ends in: {formatCountdown(timeLeft)}
          </span>
        </div>
      </div>
    );
  }

  // Fallback: If approved/expired, show standard View button (Locked/Disabled context)
  return (
    <button
      disabled
      className="px-4 py-1.5 border border-outline-variant/30 text-outline rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-not-allowed bg-surface-container-low/50"
    >
      Locked for Review
    </button>
  );
};

/**
 * ProgressTracker Component
 * Visualizes the lifecycle of a device request.
 */
const ProgressTracker = ({ request }) => {
  if (!request) return null;

  const steps = [
    { id: 1, label: "Requested" },
    { id: 2, label: "Review" },
    { id: 3, label: "Approved" },
    { id: 4, label: "Device Ready" },
  ];

  // Logic to determine step states based on request.status
  let activeStep = 1;
  if (request.status === "pending") {
    activeStep = 2; // Requested is done, Review is in progress
  } else if (request.status === "approved") {
    activeStep = 4; // Requested, Review, Approved are done, Device Ready is in progress
  }

  return (
    <div className="bg-cardBg border border-outline-variant/30 rounded-3xl p-10 mb-12 shadow-premium animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-12">
        <h3 className="font-h2 text-xl text-on-surface">Active Request Pipeline</h3>
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {request.deviceName} ONGOING
        </span>
      </div>
      <div className="relative flex items-center justify-between px-10">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-20 right-20 h-1 bg-outline-variant/20 -translate-y-1/2" />
        {/* Active Progress Line */}
        <div
          className="absolute top-6 left-20 h-1 bg-primary -translate-y-1/2 transition-all duration-1000"
          style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
        />

        {steps.map((step) => {
          const isComplete = step.id < activeStep;
          const isActive = step.id === activeStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                  isComplete
                    ? "bg-primary text-white shadow-lg"
                    : isActive
                      ? "bg-primary text-white shadow-lg animate-pulse"
                      : "bg-surface-container-high text-outline"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <span className="font-h2 font-bold">{step.id}</span>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="font-h2 font-bold text-[10px] uppercase tracking-wider text-on-surface whitespace-nowrap">
                  {step.label}
                </p>
                <p
                  className={cn(
                    "text-[9px] font-bold uppercase mt-1",
                    isComplete ? "text-primary" : isActive ? "text-primary animate-pulse" : "text-outline"
                  )}
                >
                  {isComplete ? "COMPLETE" : isActive ? "IN PROGRESS" : "PENDING"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DeviceRequest = () => {
  const { user } = useAuth();
  const { requests, loading, error } = useDeviceRequests(user?.uid);

  const [toastConfig, setToastConfig] = useState({ isOpen: false, message: "", type: "success" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeRequest = useMemo(() => {
    return requests.find((r) => r.status === "pending" || r.status === "approved");
  }, [requests]);

  const triggerToast = useCallback((message, type = "success") => {
    setToastConfig({ isOpen: true, message, type });
  }, []);

  const handleCancelClick = (request) => {
    setSelectedRequest(request);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancellation = async (reasonData) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);

    try {
      await cancelDeviceRequest(selectedRequest.id, reasonData);
      triggerToast("Request successfully cancelled.", "success");
      setIsCancelModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      triggerToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "declined":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "cancelled":
        return "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 antialiased text-on-surface pb-12">
      <Toast
        isOpen={toastConfig.isOpen || !!error}
        message={error?.message || toastConfig.message}
        type={error ? "error" : toastConfig.type}
        onClose={() => setToastConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-h2 text-3xl lg:text-4xl text-on-surface tracking-tight uppercase">
            Device Request <span className="text-primary">History</span>
          </h1>
          <p className="text-on-surface-variant mt-2 font-body-md">
            Monitor the lifecycle of your utility expansion and hardware requests.
          </p>
        </div>
      </header>

      {/* PROGRESS TRACKER SECTION */}
      {activeRequest && <ProgressTracker request={activeRequest} />}

      {/* HISTORY TABLE SECTION */}
      <section className="bg-cardBg border border-outline-variant/30 rounded-3xl overflow-hidden shadow-premium">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-h2 text-xl uppercase tracking-tight">Request History</h3>
          <div className="flex items-center gap-4 text-outline">
             <Clock size={18} />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                  Request Number
                </th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                  Date Requested
                </th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                  Date Device Release
                </th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                  Status
                </th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                        Synchronizing Archive...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <XCircle size={40} className="text-outline" />
                      <p className="text-sm font-bold text-outline uppercase tracking-widest italic">
                        No hardware records found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req, index) => (
                  <tr
                    key={req.id}
                    className="group hover:bg-surface-container-low/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          req.status === "approved" ? "bg-green-50 text-green-600" :
                          req.status === "declined" ? "bg-red-50 text-red-600" :
                          req.status === "cancelled" ? "bg-slate-100 text-slate-300" :
                          "bg-primary/5 text-primary"
                        )}>
                          <Plus size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm uppercase">
                            Request #{index + 1}
                          </p>
                          <p className="text-[11px] text-outline font-medium">
                            {req.requestType.replace("_", " ")} ({req.deviceName})
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-on-surface">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-on-surface">
                        {req.updatedAt ? new Date(req.updatedAt).toLocaleDateString() : "—"}
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">
                        {req.updatedAt ? new Date(req.updatedAt).toLocaleTimeString() : "Not scheduled"}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
                          getStatusStyle(req.status)
                        )}
                      >
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          req.status === "pending" ? "bg-amber-500 animate-pulse" :
                          req.status === "approved" ? "bg-emerald-500" :
                          req.status === "cancelled" ? "bg-slate-300" :
                          "bg-rose-500"
                        )} />
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <RequestAction
                        request={req}
                        onCancelTrigger={handleCancelClick}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-on-surface-variant font-medium">Show</span>
            <div className="relative">
              <select className="appearance-none bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 pr-8 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none">
                <option>10 per page</option>
                <option>20 per page</option>
                <option>50 per page</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-xs">3</button>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DeviceRequest;
