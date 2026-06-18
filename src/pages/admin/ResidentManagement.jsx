import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

// Services, Hooks, at Utils
import { useResidentManagement } from "../../hooks";
import { updateUserStatus, updateUserProfile, USER_STATUS } from "../../services/user.service";
import { cn } from "../../utils/cn";

// UI Components
import {
  Toast,
  ConfirmationModal,
  EditUserModal,
  AccountProvisioningModal,
  ResidentManagementSkeleton,
} from "../../components";

import {
  ResidentManagementHeader,
  ResidentStats,
  ResidentFilters,
  ResidentTable,
} from "../../components/admin/resident-management";

import { ROLES } from "../../constants/roles";

/**
 * ResidentManagement Page (Refactored)
 * Orchestrates the management of resident users.
 */
const ResidentManagement = ({ currentUserRole }) => {
  // --- CUSTOM HOOK ---
  const { residents, allResidents, stats, loading, error, filters } = useResidentManagement();

  // --- LOCAL UI STATES ---
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);

  // --- HANDLERS ---
  const triggerToast = useCallback((message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  }, []);

  const handleConfirmStatusChange = useCallback(async () => {
    if (!selectedUser) return;
    const isCurrentActive = selectedUser.status === USER_STATUS.ACTIVE;
    const newStatus = isCurrentActive ? USER_STATUS.DISABLED : USER_STATUS.ACTIVE;

    try {
      await updateUserStatus(selectedUser.uid, newStatus);
      triggerToast(
        `Account ${newStatus === USER_STATUS.ACTIVE ? "restored" : "disabled"} successfully.`
      );
    } catch {
      triggerToast("Update failed. Please check your permissions.", "error");
    } finally {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  }, [selectedUser, triggerToast]);

  const handleSaveUserData = useCallback(
    async (newFormData) => {
      if (!selectedEditUser) return;
      setIsEditSaving(true);
      try {
        await updateUserProfile(selectedEditUser.uid, newFormData);
        triggerToast("User profile updated successfully.");
        setIsEditModalOpen(false);
        setSelectedEditUser(null);
      } catch {
        triggerToast("Failed to update profile. Try again.", "error");
      } finally {
        setIsEditSaving(false);
      }
    },
    [selectedEditUser, triggerToast]
  );

  const isTargetActive = selectedUser?.status === USER_STATUS.ACTIVE;

  if (loading && allResidents.length === 0) {
    return <ResidentManagementSkeleton />;
  }

  return (
    <div className="w-full antialiased space-y-8">
      <Toast
        isOpen={showToast || !!error}
        message={error?.message || toastConfig.message}
        type={error ? "error" : toastConfig.type}
        onClose={() => setShowToast(false)}
      />

      {/* Confirmation Modal (Status Toggle) */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={isTargetActive ? "Disable Access" : "Restore Access"}
        description={
          isTargetActive
            ? "Target will no longer be able to log in."
            : "Target will regain full system access."
        }
        confirmText={isTargetActive ? "Disable" : "Enable"}
        variant={isTargetActive ? "danger" : "primary"}
      >
        {selectedUser && (
          <div
            className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border transition-all",
              isTargetActive ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
            )}
          >
            <div
              className={cn(
                "p-3 rounded-xl",
                isTargetActive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {isTargetActive ? "Suspending" : "Activating"} {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                Resident ID: {selectedUser.uid?.substring(0, 12)}...
              </p>
            </div>
          </div>
        )}
      </ConfirmationModal>

      {/* Edit Profile Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditUser(null);
        }}
        user={selectedEditUser}
        onSave={handleSaveUserData}
        isLoading={isEditSaving}
        showRoleField={currentUserRole !== ROLES.SUPER_ADMIN}
      />

      {/* Page Header */}
      <ResidentManagementHeader />

      {/* Summary Stats */}
      <ResidentStats stats={stats} />

      {/* Filter Toolbar */}
      <ResidentFilters filters={filters} onAddClick={() => setIsProvisioningModalOpen(true)} />

      {/* Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 transition-all hover:translate-y-[-2px]">
        <ResidentTable
          residents={residents}
          onActionClick={(userData) => {
            setSelectedUser(userData);
            setIsModalOpen(true);
          }}
          onEditClick={(userData) => {
            setSelectedEditUser(userData);
            setIsEditModalOpen(true);
          }}
        />
      </div>

      {/* Provisioning Modal */}
      <AccountProvisioningModal
        isOpen={isProvisioningModalOpen}
        onClose={() => setIsProvisioningModalOpen(false)}
        mode="user"
        showRoleSelector={false}
      />
    </div>
  );
};

export default ResidentManagement;
