import { useState } from "react";
import { useUserSubscription } from "../../hooks/useUserSubscription";
import { updateUserStatus, USER_STATUS } from "../../services/user.service"; 
import Toast from "../../components/ui/Toast";
import SpinnerIcon from "../../components/ui/SpinnerIcon";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import EditUserModal from "../../components/ui/EditUserModal";
import { AlertTriangle, ShieldCheck, Users } from "lucide-react";
import { cn } from "../../utils/cn";
import { UserTable } from "../../components/ui/UserTable"; 

const AdminDashboard = ({ currentUserRole }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  // 1. State tracks what the UI requests
  const [viewMode, setViewMode] = useState(currentUserRole === "superAdmin" ? "admin" : "user");

  // 🔒 2. Safety Override: Active view calculation strictly overrides standard admin attempts
  const activeView = currentUserRole === "superAdmin" ? viewMode : "user";

  // 3. Sync hook gets the array of UIDs from Firebase
  const { data: uids = [], loading, error } = useUserSubscription(activeView);

  const triggerToast = (message, type = "success") => {
    setToastConfig({ message, type });
    setShowToast(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;

    // Notice we use selectedUser.uid here, aligned with your useFullUserData standard
    const isCurrentActive = selectedUser.status === USER_STATUS.ACTIVE;
    const newStatus = isCurrentActive ? USER_STATUS.DISABLED : USER_STATUS.ACTIVE;

    try {
      await updateUserStatus(selectedUser.uid, newStatus);
      triggerToast(`Account ${newStatus === USER_STATUS.ACTIVE ? 'restored' : 'disabled'} successfully.`);
    } catch (err) {
      triggerToast("Update failed. Please check your permissions.", "error");
    } finally {
      setIsModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSaveUserData = async (newFormData) => {
    if (!selectedEditUser) return;
    
    setIsEditSaving(true);
    try {
      // Tatawagin natin ang service function para mag-update sa Firebase
      await updateUserData(selectedEditUser.uid, newFormData);
      
      triggerToast("User profile parameter updated successfully.");
      setIsEditModalOpen(false); // Isara ang modal kapag success
      setSelectedEditUser(null);
    } catch (err) {
      triggerToast("Failed to update profile. Try again.", "error");
    } finally {
      setIsEditSaving(false);
    }
  };

  const isTargetActive = selectedUser?.status === USER_STATUS.ACTIVE;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto antialiased">
      <Toast 
        isOpen={showToast || !!error} 
        message={error || toastConfig.message} 
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
        onSave={handleSaveUserData} // Ipasa ang save function natin
        isLoading={isEditSaving} // Ipasa ang loading state natin
      />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          {currentUserRole === "superAdmin" && (
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("admin")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  activeView === "admin" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ShieldCheck size={14} /> Admins
              </button>
              <button
                onClick={() => setViewMode("user")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                  activeView === "user" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Users size={14} /> Residents
              </button>
            </div>
          )}

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeView} <span className="text-blue-600">Directory</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Managing system profiles parameters.
            </p>
          </div>
        </div>

        <input 
          type="text" 
          placeholder={`Search ${activeView}s...`} 
          className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      {loading && uids.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in duration-500">
          <SpinnerIcon className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Syncing SmartAqua Records...
          </p>
        </div>
      ) : (
        <UserTable 
          uids={uids} 
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

export default AdminDashboard;