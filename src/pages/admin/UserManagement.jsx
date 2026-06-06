import { useState, useCallback, useMemo } from "react";
import { AlertTriangle } from "lucide-react";

// Services, Hooks, at Utils
import { useUserSubscription } from "../../hooks";
import { updateUserStatus, updateUserProfile, USER_STATUS } from "../../services/user.service";
import { cn } from "../../utils/cn";
import { ROLES } from "../../constants/roles";

// UI Components
import {
  Toast,
  ConfirmationModal,
  EditUserModal,
  AccountProvisioningModal,
  UserTable,
  UserTableSkeleton,
} from "../../components";

// Admin Specific Components
import {
  UserManagementHeader,
  UserManagementStats,
  UserManagementFilters,
} from "../../components/admin/user-management";

const UserManagement = ({ currentUserRole }) => {
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("Location");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [isProvisioningModalOpen, setIsProvisioningModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState(
    currentUserRole === ROLES.SUPER_ADMIN ? ROLES.ADMIN : ROLES.RESIDENT
  );

  // --- DERIVED LOGIC & FIREBASE SYNC ---
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;

  // We subscribe to all users if superAdmin to show global stats,
  // otherwise we might be limited by permissions (subscribing to null might fail if not superAdmin)
  // For now, let's try to get all if superAdmin, or just residents if admin
  const subscriptionTarget = isSuperAdmin ? null : ROLES.RESIDENT;
  const { data: allUsers = [], loading, error } = useUserSubscription(subscriptionTarget);

  const stats = useMemo(() => {
    const admins = allUsers.filter((u) => u.role === ROLES.ADMIN).length;
    const residents = allUsers.filter((u) => u.role === ROLES.RESIDENT).length;
    return {
      total: allUsers.length,
      admins,
      residents,
    };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // 1. Role/View Filter
      const matchesView = isSuperAdmin ? u.role === viewMode : u.role === ROLES.RESIDENT;

      // 2. Search Filter
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) || (u.email || "").toLowerCase().includes(searchLower);

      // 3. Location Filter
      const userLocation = u.address?.baranggay || "";
      const matchesLocation = locationFilter === "Location" || userLocation === locationFilter;

      return matchesView && matchesSearch && matchesLocation;
    });
  }, [allUsers, viewMode, searchTerm, locationFilter, isSuperAdmin]);

  // --- MEMOIZED HANDLERS ---
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

  return (
    <div className="w-full antialiased space-y-8">
      <Toast
        isOpen={showToast || !!error}
        message={error?.message || toastConfig.message}
        type={error ? "error" : toastConfig.type}
        onClose={() => setShowToast(false)}
      />

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
                Role: {selectedUser.role}
              </p>
            </div>
          </div>
        )}
      </ConfirmationModal>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditUser(null);
        }}
        user={selectedEditUser}
        onSave={handleSaveUserData}
        isLoading={isEditSaving}
      />

      {/* Page Header */}
      <UserManagementHeader />

      {/* Summary Bento Grid */}
      <UserManagementStats stats={stats} />

      {/* Filters Section */}
      <UserManagementFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        isSuperAdmin={isSuperAdmin}
        onAddClick={() => setIsProvisioningModalOpen(true)}
      />

      {/* User Table Section */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 transition-all hover:translate-y-[-2px]">
        {loading && allUsers.length === 0 ? (
          <UserTableSkeleton />
        ) : (
          <UserTable
            users={filteredUsers}
            onActionClick={(userData) => {
              setSelectedUser(userData);
              setIsModalOpen(true);
            }}
            onEditClick={(userData) => {
              setSelectedEditUser(userData);
              setIsEditModalOpen(true);
            }}
            searchTerm={searchTerm}
            activeView={viewMode}
            currentUserRole={currentUserRole}
            isLoading={loading}
          />
        )}
      </div>

      {/* Provisioning Modal */}
      <AccountProvisioningModal
        isOpen={isProvisioningModalOpen}
        onClose={() => setIsProvisioningModalOpen(false)}
        mode={viewMode === ROLES.ADMIN ? "staff" : "user"}
      />
    </div>
  );
};

export default UserManagement;
