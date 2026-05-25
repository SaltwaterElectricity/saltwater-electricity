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
 * RequestManagement Page (Renamed to Request Validation in UI)
 * Admin/SuperAdmin view to manage device requests from residents.
 * Redesigned to match 'code.html' specifications.
 */
const RequestManagement = () => {
  const { user: adminUser } = useAuth();
  const { requests, loading: requestsLoading } = useDeviceRequests();
  const { data: users, loading: usersLoading } = useUserSubscription(ROLES.RESIDENT);

  // TOAST STATE
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // MODAL STATES
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' or 'decline'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORM STATES
  const [approveForm, setApproveForm] = useState({ deviceId: "", deviceAssignId: "" });
  const [declineForm, setDeclineForm] = useState({ reason: "" });

  // HYDRATION: Map userId to Name, Email, and Location
  const hydratedRequests = useMemo(() => {
    if (!requests || !users) return [];
    return requests.map((req) => {
      const resident = users.find((u) => u.id === req.userId);
      return {
        ...req,
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Unknown Resident",
        residentEmail: resident?.email || "",
        residentLocation:
          resident?.address?.street || resident?.address?.baranggay || "Unknown Location",
      };
    });
  }, [requests, users]);

  // FILTERING LOGIC
  const filteredRequests = useMemo(() => {
    return hydratedRequests.filter((req) => {
      const matchesSearch =
        req.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.residentEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || req.status === statusFilter;

      const matchesLocation =
        locationFilter === "all" ||
        req.residentLocation.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [hydratedRequests, searchTerm, statusFilter, locationFilter]);

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

      // Map 'approve' to 'approved' and 'decline' to 'declined' for the service
      const targetStatus = modalType === "approve" ? "approved" : "declined";

      await updateRequestStatus(selectedRequest.id, targetStatus, extraData);

      triggerToast(`Request ${targetStatus} successfully.`);
      handleCloseModal();
    } catch (err) {
      triggerToast(err.message || "Failed to process request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The new design uses a single "View" button that opens the modal
  // For pending requests, we'll open a "selection" or default to "approve" in the existing modal
  // But since the current modal is binary (approve OR decline), we'll default to 'approve' for View
  // unless we want a new 'View' modal. Let's stick to 'approve' as the entry point for viewing/processing.
  const handleViewRequest = (req) => {
    if (req.status === "pending") {
      handleOpenModal(req, "approve");
    } else {
      // If already processed, we just show the details (could be a read-only view)
      // For now, let's just open the modal in its processed state if possible,
      // but the current ProcessRequestModal is for processing.
      // We'll just trigger the toast if it's already resolved for now, or open as 'approve' with disabled fields.
      handleOpenModal(req, req.status === "approved" ? "approve" : "decline");
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto antialiased bg-[#F8FAFC] min-h-screen">
      <Toast
        isOpen={showToast}
        message={toastConfig.message}
        type={toastConfig.type}
        onClose={() => setShowToast(false)}
      />

      {/* PAGE TITLE SECTION */}
      <RequestManagementHeader />

      {/* STATISTIC SUMMARY CARDS */}
      <RequestManagementStats requests={hydratedRequests} />

      {/* MAIN TABLE CONTAINER with Filters */}
      <RequestTable
        requests={filteredRequests}
        loading={requestsLoading || usersLoading}
        onView={handleViewRequest}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
      />

      {/* MODALS */}
      <ProcessRequestModal
        isOpen={!!modalType}
        onClose={handleCloseModal}
        request={selectedRequest}
        modalType={modalType}
        setModalType={setModalType}
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
