import { useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/useAuth";
import { useDeviceRequests, useUserSubscription } from "../../hooks";
import { ROLES } from "../../constants/roles";
import { updateRequestStatus } from "../../services/request.service";
import Toast from "../../components/ui/Toast";
import {
  RequestManagementHeader,
  RequestManagementStats,
  RequestTable,
  ProcessRequestModal,
} from "../../components/admin/request-management";

/**
 * RequestManagement Page
 * Admin/SuperAdmin view to manage device requests from residents.
 */
const RequestManagement = () => {
  const { user: adminUser } = useAuth();
  const { requests, loading: requestsLoading } = useDeviceRequests();
  const { data: users, loading: usersLoading } = useUserSubscription(ROLES.RESIDENT);

  // TOAST STATE
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  // MODAL STATES
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' or 'decline'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORM STATES
  const [approveForm, setApproveForm] = useState({ deviceId: "", deviceAssignId: "" });
  const [declineForm, setDeclineForm] = useState({ reason: "" });

  // HYDRATION: Map userId to Name
  const hydratedRequests = useMemo(() => {
    if (!requests || !users) return [];
    return requests.map((req) => {
      const resident = users.find((u) => u.id === req.userId);
      return {
        ...req,
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Unknown Resident",
      };
    });
  }, [requests, users]);

  const triggerToast = useCallback((message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  }, []);

  const handleOpenModal = useCallback((req, type) => {
    setSelectedRequest(req);
    setModalType(type);
    if (type === "approve") {
      setApproveForm({ deviceId: "", deviceAssignId: "" });
    } else {
      setDeclineForm({ reason: "" });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedRequest(null);
    setModalType(null);
  }, []);

  const handleProcessRequest = async (e) => {
    e.preventDefault();
    if (isSubmitting || !selectedRequest) return;

    setIsSubmitting(true);
    try {
      const extraData =
        modalType === "approve"
          ? { ...approveForm, adminId: adminUser.uid }
          : { ...declineForm, adminId: adminUser.uid };

      await updateRequestStatus(
        selectedRequest.id,
        modalType === "approved" ? "approved" : modalType + "d",
        extraData
      );

      triggerToast(`Request ${modalType}d successfully.`);
      handleCloseModal();
    } catch (err) {
      triggerToast(err.message || "Failed to process request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto antialiased">
      <Toast
        isOpen={showToast}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setShowToast(false)}
      />

      {/* HEADER SECTION */}
      <RequestManagementHeader />

      {/* STATS OVERVIEW */}
      <RequestManagementStats requests={hydratedRequests} />

      {/* MAIN TABLE CONTAINER */}
      <RequestTable
        requests={hydratedRequests}
        loading={requestsLoading || usersLoading}
        onApprove={(req) => handleOpenModal(req, "approve")}
        onDecline={(req) => handleOpenModal(req, "decline")}
      />

      {/* MODALS */}
      <ProcessRequestModal
        isOpen={!!modalType}
        onClose={handleCloseModal}
        request={selectedRequest}
        modalType={modalType}
        isSubmitting={isSubmitting}
        onSubmit={handleProcessRequest}
        approveForm={approveForm}
        setApproveForm={setApproveForm}
        declineForm={declineForm}
        setDeclineForm={setDeclineForm}
      />
    </div>
  );
};

export default RequestManagement;
