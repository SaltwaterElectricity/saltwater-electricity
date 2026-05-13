<<<<<<< HEAD
import { useMemo } from "react";
import {
  useUserSubscription,
  useAuditLogs,
  useDeviceRequests,
  useDevices,
  useHistory,
} from "../../hooks";
import { MetricCard, AIInsightCard, AnalyticsChart, UserRow, EventItem } from "../../components";
import { useAuth } from "../../context/useAuth";
import { Footer } from "../../layout";
import { SENSOR_CONFIG, METRICS } from "../../constants";

/**
 * MAIN ADMIN DASHBOARD PAGE
 */
const AdminDashboard = () => {
  const { userRole } = useAuth();
  const { data: users, loading: usersLoading } = useUserSubscription();
  const { logs: auditLogs, loading: logsLoading } = useAuditLogs(10);
  const { requests } = useDeviceRequests();
  const { devices } = useDevices();

  // Pick the first device ID to show in the analytics chart
  const activeDeviceId = useMemo(() => {
    return devices.length > 0 ? devices[0].device_id : null;
  }, [devices]);

  const { logs: historicalLogs } = useHistory(activeDeviceId, 20);

  // Aggregating real data for the dynamic chart
  const voltageData = useMemo(() => {
    if (!historicalLogs || historicalLogs.length === 0) return [];
    return [...historicalLogs]
      .reverse() // Show chronological order in chart
      .map((log) => ({
        timestamp: new Date(log.__normalizedTs).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: log.voltage || 0,
      }));
  }, [historicalLogs]);

  const salinityData = useMemo(() => {
    if (!historicalLogs || historicalLogs.length === 0) return [];
    return [...historicalLogs].reverse().map((log) => ({
      timestamp: new Date(log.__normalizedTs).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: log.tds_ppm || 0,
    }));
  }, [historicalLogs]);

  // MOCK STATS (Aggregated from real data)
  const stats = useMemo(() => {
    const latestLog = historicalLogs[0] || {};
    const tdsThreshold = SENSOR_CONFIG[METRICS.TDS].critical;

    return {
      voltage: latestLog.voltage ? `${latestLog.voltage}V` : "0V",
      salinity: latestLog.tds_ppm ? `${latestLog.tds_ppm}ppt` : "0ppt",
      activeUsers: users?.length || 0,
      health: latestLog.tds_ppm < tdsThreshold ? "98%" : "72%",
    };
  }, [users, historicalLogs]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 1. WELCOME HEADER */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl lg:text-3xl text-primary mb-2 tracking-tight italic uppercase">
            Welcome, <span className="text-primary-container">{userRole}.</span>
          </h1>
          <p className="font-['Inter'] text-body-md text-on-surface-variant">
            System overview for the Philippine Seascape Energy Grid. Global visibility active.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-secondary-container/20 px-6 py-3 rounded-full border border-secondary-container/30">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-fixed" />
          </span>
          <span className="font-['Space_Grotesk'] text-sm font-bold text-blue-800 uppercase tracking-widest">
            Generating: 1.2GW
          </span>
        </div>
      </header>

      {/* 2. METRICS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="VOLTAGE"
          value={stats.voltage}
          status="STABLE NOMINAL"
          icon="electric_bolt"
          colorClass="text-primary"
        />
        <MetricCard
          title="SALINITY"
          value={stats.salinity}
          status="OPTIMAL BRINE"
          icon="water"
          colorClass="text-primary"
        />
        <MetricCard
          title="ACTIVE USERS"
          value={stats.activeUsers}
          status={`${requests?.filter((r) => r.status === "pending").length || 0} NEW REQ`}
          icon="group"
          colorClass="text-primary"
        />
        <MetricCard
          title="HEALTH"
          value={stats.health}
          status="NORMAL OPS"
          icon="favorite"
          colorClass="text-tertiary"
          isHealth
        />
      </div>

      {/* 3. DASHBOARD CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: AI & CHARTS & USER TABLE */}
        <div className="lg:col-span-8 space-y-6">
          <AIInsightCard />

          <AnalyticsChart voltageData={voltageData} salinityData={salinityData} />

          {/* SYSTEM ACCESS CONTROL */}
          <div className="glass-panel p-6 rounded-[20px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-primary uppercase tracking-tighter italic">
                  System Access <span className="text-primary-container">Control</span>
                </h3>
                <p className="font-['Inter'] text-[13px] text-on-surface-variant mt-1">
                  SuperAdmin Oversight: Managing global operators and node permissions.
                </p>
              </div>
              <button className="ocean-gradient text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg mr-2">person_add</span> Add
                Global Admin
              </button>
            </div>
            <div className="overflow-x-auto custom-scrollbar-hide">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline/10 text-[10px] font-bold text-outline uppercase tracking-[0.25em]">
                    <th className="pb-3 pl-2">Operator</th>
                    <th className="pb-3">Global Role</th>
                    <th className="pb-3">Assigned Region</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/10">
                  {users?.slice(0, 5).map((user) => (
                    <UserRow key={user.uid} user={user} />
                  ))}
                  {usersLoading && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-[13px] font-bold text-outline animate-pulse uppercase tracking-widest font-['Inter']"
                      >
                        Synchronizing Operator Database...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-outline/10 text-center">
              <a
                className="text-[13px] font-bold text-primary hover:underline uppercase tracking-widest font-['Inter']"
                href="#"
              >
                Manage all system users
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PENDING ACCESS & EVENT FEED */}
        <div className="lg:col-span-4 space-y-6">
          {/* PENDING ACCESS */}
          <div className="glass-panel p-6 border-primary/20 bg-primary/5 rounded-[20px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-primary uppercase tracking-tighter">
                Pending <span className="text-primary-container">Request</span>
              </h3>
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse tracking-widest font-['Inter']">
                {requests?.filter((r) => r.status === "pending").length || 0} NEW
              </span>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar-hide">
              {requests
                ?.filter((r) => r.status === "pending")
                .map((req) => (
                  <div
                    key={req.id}
                    className="bg-white/80 p-4 rounded-xl border border-white/60 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                        <span className="material-symbols-outlined">sensors</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-on-surface font-['Inter']">
                          {req.deviceName || "Access Request"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-['Inter']">
                          ID: {req.id?.substring(0, 12).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter font-['Inter']">
                          System Grid Request
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button className="py-2 bg-primary text-white rounded-lg text-[10px] font-bold hover:opacity-90 transition-all uppercase tracking-widest active:scale-95 shadow-sm shadow-primary/10 font-['Inter']">
                        Approve
                      </button>
                      <button className="py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-all uppercase tracking-widest active:scale-95 font-['Inter']">
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              {requests?.filter((r) => r.status === "pending").length === 0 && (
                <p className="text-center text-[13px] font-bold text-outline uppercase tracking-widest py-10 italic font-['Inter']">
                  No pending requests.
                </p>
              )}
            </div>
            <div className="mt-4 text-center">
              <button className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors font-['Inter']">
                Clear all requests
              </button>
            </div>
          </div>

          {/* SYSTEM EVENT FEED */}
          <div className="glass-panel h-[480px] flex flex-col rounded-[20px]">
            <div className="p-6 border-b border-white/40 flex justify-between items-center">
              <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-primary uppercase tracking-tighter italic">
                System <span className="text-primary-container">Events</span>
              </h3>
              <span className="bg-slate-100 text-[10px] font-bold px-2 py-1 rounded tracking-[0.2em] text-slate-600 uppercase shadow-inner font-['Inter']">
                Live Feed
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-hide">
              {auditLogs?.map((log) => (
                <EventItem key={log.id} log={log} />
              ))}
              {logsLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">
                    sync
                  </span>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em] font-['Inter']">
                    Inflating Event Stream...
                  </span>
                </div>
              )}
            </div>
            <div className="p-6 text-center border-t border-white/40">
              <a
                className="text-[13px] font-bold text-primary hover:underline uppercase tracking-widest font-['Inter']"
                href="#"
              >
                View All Security Logs
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
=======
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
import { useUserSubscription } from "../../hooks/useUserSubscription";
import { updateUserStatus, updateUserProfile, USER_STATUS } from "../../services/user.service"; 
import { cn } from "../../utils/cn";
import { ROUTES } from "../../constants/routes";

// UI Components
import Toast from "../../components/ui/Toast";
import SpinnerIcon from "../../components/ui/SpinnerIcon";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import EditUserModal from "../../components/ui/EditUserModal";
import { UserTable } from "../../components/ui/UserTable"; 

const AdminDashboard = ({ currentUserRole }) => {
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

  const [viewMode, setViewMode] = useState(currentUserRole === "superAdmin" ? "admin" : "user");

  // --- DERIVED LOGIC & FIREBASE SYNC ---
  const isSuperAdmin = currentUserRole === "superAdmin";
  const activeView = isSuperAdmin ? viewMode : "user";
  const { data: uids = [], loading, error } = useUserSubscription(activeView);

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
    } catch (err) {
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
    } catch (err) {
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
        onSave={handleSaveUserData}
        isLoading={isEditSaving}
      />

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4">
          {isSuperAdmin && (
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
              Managing system profiles and role-based parameters.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <input 
            type="text" 
            placeholder={`Search ${activeView}s...`} 
            className="px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            {isSuperAdmin && activeView === "admin" && (
              <button 
                onClick={() => navigate(ROUTES.REGISTER_STAFF)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
              >
                <ShieldPlus size={16} /> Register Staff
              </button>
            )}

            {activeView === "user" && (
              <button 
                onClick={() => navigate(ROUTES.REGISTER_USER)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                <UserPlus size={16} /> Register Resident
              </button>
            )}
          </div>
        </div>
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    </div>
  );
};

<<<<<<< HEAD
export default AdminDashboard;
=======
export default AdminDashboard;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
