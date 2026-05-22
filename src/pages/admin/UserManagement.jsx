import { useState, useCallback, useMemo } from "react";
import { ShieldCheck, Users, AlertTriangle, Search, Home, ChevronDown } from "lucide-react";

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
    <div className="p-gutter max-w-[1440px] mx-auto w-full antialiased space-y-8">
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
      <div>
        <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
          User Management
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage all admin and household users within the monitoring system.
        </p>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <Users className="text-[#3D73FF]" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
              Total Users
            </p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.total}</h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[15, 25, 45, 65, 90].map((h) => (
              <div
                key={`total-bar-${h}`}
                className="w-1 bg-[#3D73FF] rounded-t-sm"
                style={{ height: `${h}%`, opacity: h / 100 }}
              />
            ))}
          </div>
        </div>

        {/* Admin Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <ShieldCheck className="text-[#10B981]" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
              Admin Users
            </p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.admins}</h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[20, 40, 60, 80, 100].map((h) => (
              <div
                key={`admin-bar-${h}`}
                className="w-1 bg-[#10B981] rounded-t-sm"
                style={{ height: `${h}%`, opacity: h / 100 }}
              />
            ))}
          </div>
        </div>

        {/* Household Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#F5F3FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <Home className="text-[#7C3AED]" size={28} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">
              Household Users
            </p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">
              {stats.residents}
            </h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[10, 30, 50, 75, 95].map((h) => (
              <div
                key={`resident-bar-${h}`}
                className="w-1 bg-[#7C3AED] rounded-t-sm"
                style={{ height: `${h}%`, opacity: h / 100 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-outline-variant/30 transition-all hover:translate-y-[-2px]">
        <div className="flex flex-1 flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none transition-all font-body-md"
              placeholder="Search user name or email"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter (Only for Super Admin) */}
          {isSuperAdmin && (
            <div className="relative min-w-[160px]">
              <select
                className="w-full appearance-none bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary-container/20 pr-10"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option value={ROLES.ADMIN}>Admins</option>
                <option value={ROLES.RESIDENT}>Residents</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
                size={16}
              />
            </div>
          )}

          {/* Location Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              className="w-full appearance-none bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary-container/20 pr-10"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="Location">All Locations</option>
              {/* These could be dynamic based on user data */}
              <option value="San Andres">San Andres</option>
              <option value="Unisan">Unisan</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              size={16}
            />
          </div>
        </div>

        <button
          onClick={() => setIsProvisioningModalOpen(true)}
          className="primary-gradient-btn text-white px-8 py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add User
        </button>
      </div>

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
