import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  AlertTriangle, 
  Search, 
  MapPin, 
  ChevronDown,
  Edit3, 
  Trash2, 
  RotateCcw
} from "lucide-react";

// Services, Hooks, at Utils
import { useUserSubscription, useAssignments, useDevices } from "../../hooks";
import { updateUserStatus, updateUserProfile, USER_STATUS } from "../../services/user.service";
import { cn } from "../../utils/cn";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";

// UI Components
import {
  Toast,
  ConfirmationModal,
  EditUserModal,
  UserTableSkeleton,
} from "../../components";

const ResidentManagement = () => {
  const navigate = useNavigate();

  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Users");
  const [locationFilter, setLocationFilter] = useState("Location");
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  // --- DATA FETCHING ---
  const { data: residents = [], loading: usersLoading, error } = useUserSubscription(ROLES.RESIDENT);
  const { assignments: assignmentsObj = {} } = useAssignments();
  const { devices = [], telemetry = {} } = useDevices();

  // --- DERIVED LOGIC ---
  const hydratedResidents = useMemo(() => {
    const assignments = Object.values(assignmentsObj);
    return residents.map(res => {
      const assignment = assignments.find(a => a.userId === res.id);
      const device = assignment ? devices.find(d => d.device_id === assignment.deviceId) : null;
      const tel = device ? telemetry[device.device_id] : null;
      
      // Determine if online (last 5 mins)
      const isOnline = tel && tel.timestamp && (Date.now() - tel.timestamp < 300000);

      return {
        ...res,
        assignedDevice: device ? device.deviceName || device.device_id : "No Device",
        isOnline: !!isOnline
      };
    });
  }, [residents, assignmentsObj, devices, telemetry]);

  const stats = useMemo(() => {
    const online = hydratedResidents.filter(r => r.isOnline).length;
    const offline = hydratedResidents.length - online;
    return {
      total: hydratedResidents.length,
      online,
      offline
    };
  }, [hydratedResidents]);

  const filteredResidents = useMemo(() => {
    return hydratedResidents.filter(r => {
      // 1. Search Filter
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(searchLower) || (r.email || "").toLowerCase().includes(searchLower);
      
      // 2. Status/Online Filter
      const matchesStatus = statusFilter === "All Users" || 
        (statusFilter === "Online Residents" && r.isOnline) ||
        (statusFilter === "Offline Residents" && !r.isOnline);

      // 3. Location Filter
      const userLocation = r.address?.baranggay || "";
      const matchesLocation = locationFilter === "Location" || userLocation === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [hydratedResidents, searchTerm, statusFilter, locationFilter]);

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
          <div className={cn(
            "flex items-start gap-4 p-4 rounded-2xl border transition-all",
            isTargetActive ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
          )}>
            <div className={cn(
              "p-3 rounded-xl",
              isTargetActive ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            )}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">
                {isTargetActive ? "Suspending" : "Activating"} {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tighter">
                Resident ID: {selectedUser.uid?.substring(0, 12)}...
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
        <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">RESIDENT Management</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage all admin and household users within the monitoring system.</p>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#EEF2FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[#3D73FF] text-[28px]">person</span>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">Total HOUSEHOLD USER</p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.total}</h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[15, 25, 45, 65, 90].map((h) => (
              <div key={`total-bar-${h}`} className="w-1 bg-[#3D73FF] rounded-t-sm" style={{ height: `${h}%`, opacity: h / 100 }} />
            ))}
          </div>
        </div>

        {/* Active Residents Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#ECFDF5] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[#10B981] text-[28px]">admin_panel_settings</span>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">ACTIVE RESIDENT&apos;S</p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.online}</h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[20, 40, 60, 80, 100].map((h) => (
              <div key={`active-bar-${h}`} className="w-1 bg-[#10B981] rounded-t-sm" style={{ height: `${h}%`, opacity: h / 100 }} />
            ))}
          </div>
        </div>

        {/* Offline Residents Card */}
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center gap-4 relative overflow-hidden group">
          <div className="w-14 h-14 bg-[#F5F3FF] rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[#7C3AED] text-[28px]">home_pin</span>
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium text-gray-500 uppercase tracking-tight mb-1">OFFLINE RESIDENT&apos;S</p>
            <h4 className="text-2xl font-bold text-[#0F172A] leading-none mb-2">{stats.offline}</h4>
          </div>
          <div className="flex items-end gap-[3px] h-10 self-end mb-1">
            {[10, 30, 50, 75, 95].map((h) => (
              <div key={`offline-bar-${h}`} className="w-1 bg-[#7C3AED] rounded-t-sm" style={{ height: `${h}%`, opacity: h / 100 }} />
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

          {/* Online/Offline Filter */}
          <div className="relative min-w-[180px]">
            <select 
              className="w-full appearance-none bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary-container/20 pr-10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Users">All Users</option>
              <option value="Online Residents">Online Residents</option>
              <option value="Offline Residents">Offline Residents</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={16} />
          </div>

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
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={16} />
          </div>
        </div>

        <button 
          onClick={() => navigate(ROUTES.REGISTER_USER)}
          className="primary-gradient-btn text-white px-8 py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Resident
        </button>
      </div>

      {/* User Table Section */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 transition-all hover:translate-y-[-2px]">
        {usersLoading && hydratedResidents.length === 0 ? (
          <UserTableSkeleton />
        ) : (
          <ResidentTable
            residents={filteredResidents}
            onActionClick={(userData) => {
              setSelectedUser(userData);
              setIsModalOpen(true);
            }}
            onEditClick={(userData) => {
              setSelectedEditUser(userData);
              setIsEditModalOpen(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

const ResidentTable = ({ residents = [], onActionClick, onEditClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30">
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Devices</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date Joined</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {residents.length > 0 ? (
            residents.map((res) => (
              <ResidentTableRow
                key={res.uid || res.id}
                resident={res}
                onEditClick={onEditClick}
                onActionClick={onActionClick}
              />
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-8 py-20 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                  <div className="p-6 bg-surface-container-low rounded-3xl text-outline border border-outline-variant/20">
                    <Users size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">No Residents Found</h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">Try adjusting your filters or search terms.</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ResidentTableRow = ({ resident, onActionClick, onEditClick }) => {
  const {
    firstName = "",
    lastName = "",
    email = "",
    assignedDevice = "No Device",
    address = {},
    createdAt,
    photoURL,
    status = "disabled",
    isOnline
  } = resident;

  const isActive = status === "active";
  const dateJoined = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : "N/A";

  return (
    <tr className="hover:bg-primary/5 transition-colors group border-b border-outline-variant/20 last:border-b-0 transition-all duration-200">
      {/* USER */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm">
              {firstName[0]}{lastName[0]}
            </div>
          )}
          <div>
            <p className="font-label-md text-label-md text-on-surface leading-tight">{firstName} {lastName}</p>
            <p className="text-[12px] text-outline truncate max-w-[180px]">{email}</p>
          </div>
        </div>
      </td>

      {/* DEVICES */}
      <td className="px-6 py-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider",
          assignedDevice !== "No Device" ? "bg-secondary/10 text-secondary" : "bg-slate-100 text-slate-400"
        )}>
          {assignedDevice}
        </span>
      </td>

      {/* LOCATION */}
      <td className="px-6 py-5 font-body-md text-on-surface-variant">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-outline" />
          <span className="truncate max-w-[150px]">{address?.baranggay || "Location unset"}</span>
        </div>
      </td>

      {/* DATE JOINED */}
      <td className="px-6 py-5 font-body-md text-on-surface-variant">{dateJoined}</td>

      {/* STATUS */}
      <td className="px-6 py-5">
        <div className={cn(
          "flex items-center gap-2 font-label-sm text-label-sm",
          isOnline ? "text-green-600" : "text-slate-400"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            isOnline ? "bg-green-500" : "bg-slate-300"
          )} />
          <span>{isOnline ? "Active" : "Offline"}</span>
        </div>
      </td>

      {/* ACTION */}
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEditClick(resident)} className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-all active:scale-90">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onActionClick(resident)} className={cn(
            "p-2 rounded-lg transition-all active:scale-90",
            isActive ? "text-outline hover:text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
          )}>
            {isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ResidentManagement;
