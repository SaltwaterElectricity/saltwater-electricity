import { useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests } from "../../hooks";
import { CancelRequestModal, Toast } from "../../components";
import {
  DeviceRequestProgress,
  RequestHistoryTable,
} from "../../components/device/device-request";
import { cancelDeviceRequest } from "../../services/request.service";

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

  const handleCancelClick = useCallback((request) => {
    setSelectedRequest(request);
    setIsCancelModalOpen(true);
  }, []);

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
      {activeRequest && <DeviceRequestProgress request={activeRequest} />}

      {/* HISTORY TABLE SECTION */}
      <RequestHistoryTable
        requests={requests}
        loading={loading}
        onCancelTrigger={handleCancelClick}
      />

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
