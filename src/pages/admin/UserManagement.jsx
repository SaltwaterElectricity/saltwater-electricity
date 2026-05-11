import { useState, useCallback } from "react"; // Added useCallback
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  ShieldPlus, 
  ShieldCheck, 
  Users, 
  AlertTriangle 
} from "lucide-react";

// Services, Hooks, at Utils
import { useUserSubscription } from "../../hooks";
import { updateUserStatus, updateUserProfile, USER_STATUS } from "../../services/user.service"; 
import { cn } from "../../utils/cn";
import { ROUTES } from "../../constants/routes";

// UI Components
import { ROLES } from "../../constants/roles";
import { 
  Toast, 
  ConfirmationModal, 
  EditUserModal, 
  UserTable, 
  GlobalSearch,
  UserTableSkeleton 
} from "../../components";

const UserManagement = ({ currentUserRole }) => {
  const navigate = useNavigate();

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [viewMode, setViewMode] = useState(currentUserRole === ROLES.SUPER_ADMIN ? ROLES.ADMIN : ROLES.RESIDENT);

  // --- DERIVED LOGIC & FIREBASE SYNC ---
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;
  const activeView = isSuperAdmin ? viewMode : ROLES.RESIDENT;
  const { data: users = [], loading, error } = useUserSubscription(activeView);


  // --- MEMOIZED HANDLERS ---
  
  // In-apply ang useCallback dito para hindi mag-recreate ang function sa bawat render
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
      triggerToast(`Account ${newStatus === USER_STATUS.ACTIVE ? 'restored' : 'disabled'} successfully.`);
    } catch {
      triggerToast("Update failed. Please check your permissions.", "error");
    } finally {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  }, [selectedUser, triggerToast]); // Dependencies: selectedUser at triggerToast

  const handleSaveUserData = useCallback(async (newFormData) => {
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
  }, [selectedEditUser, triggerToast]); // Dependency: selectedEditUser at triggerToast

  const isTargetActive = selectedUser?.status === USER_STATUS.ACTIVE;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto antialiased">
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
        description={isTargetActive ? "Target will no longer be able to log in." : "Target will regain full system access."}
        confirmText={isTargetActive ? "Disable" : "Enable"}
        variant={isTargetActive ? "danger" : "primary"}
      >
        {selectedUser && (
          <div className={cn(
            "flex items-start gap-4 p-4 rounded-2xl border",
            isTargetActive ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
          )}>
            <div className={cn("p-3 rounded-xl", isTargetActive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {isTargetActive ? "Suspending" : "Activating"} {selectedUser.firstName} {selectedUser.lastName}
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

      <header className="glass-card p-6 md:p-8 rounded-[32px] flex flex-col xl:flex-row flex-wrap items-center justify-between gap-6 xl:gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 w-full xl:w-auto">
          {isSuperAdmin && (
            <div className="inline-flex p-2 bg-slate-900/5 backdrop-blur-sm rounded-2xl border border-slate-200/50 shrink-0">
              <button
                onClick={() => setViewMode(ROLES.ADMIN)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === ROLES.ADMIN ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ShieldCheck size={14} /> Admins
              </button>
              <button
                onClick={() => setViewMode(ROLES.RESIDENT)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeView === ROLES.RESIDENT ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Users size={14} /> Residents
              </button>
            </div>
          )}

          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3 truncate">
              {activeView} <span className="text-blue-600">Directory</span>
            </h1>
            <p className="text-slate-500 text-xs lg:text-sm font-medium truncate">
              Managing system profiles and role-based parameters.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto flex-wrap">
          <GlobalSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            isSearching={loading}
            placeholder={`Search ${activeView}s...`}
            className="w-full xl:w-80"
          />

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            {isSuperAdmin && activeView === ROLES.ADMIN && (
              <button 
                onClick={() => navigate(ROUTES.REGISTER_STAFF)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl transition-all active:scale-95 whitespace-nowrap"
              >
                <ShieldPlus size={16} /> Register Staff
              </button>
            )}

            {activeView === ROLES.RESIDENT && (
              <button 
                onClick={() => navigate(ROUTES.REGISTER_USER)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap"
              >
                <UserPlus size={16} /> Register Resident
              </button>
            )}
          </div>

        </div>
      </header>

      {loading && users.length === 0 ? (
        <UserTableSkeleton />
      ) : (
        <UserTable 
          users={users} 
          onActionClick={(userData) => {
            setSelectedUser(userData);
            setIsModalOpen(true);
          }}
          onEditClick={(userData) => {
            setSelectedEditUser(userData);
            setIsEditModalOpen(true);
          }}
          searchTerm={searchTerm}
          activeView={activeView}
          currentUserRole={currentUserRole}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default UserManagement;
