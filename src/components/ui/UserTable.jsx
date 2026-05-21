import { ROLES } from "../../constants/roles";
import { cn } from "../../utils/cn";
import { memo } from "react";
import { MapPin, Edit3, Trash2, RotateCcw, Users } from "lucide-react";

// 🧬 MOLECULE: Individual Real-Time Row
const UserTableRow = memo(({ user, onActionClick, onEditClick }) => {
  const {
    firstName = "",
    lastName = "",
    email = "",
    role = "",
    status = "disabled",
    address = {},
    createdAt,
    photoURL,
  } = user || {};

  const isActive = status === "active";
  const isPending = status === "pending";

  const dateJoined = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : "N/A";

  return (
    <tr className="hover:bg-primary/5 transition-colors group border-b border-outline-variant/20 last:border-b-0 transition-all duration-200 ease-in-out">
      {/* USER */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          {photoURL ? (
            <img src={photoURL} alt="User Avatar" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container font-bold text-sm">
              {firstName[0]}{lastName[0]}
            </div>
          )}
          <div>
            <p className="font-label-md text-label-md text-on-surface leading-tight">
              {firstName} {lastName}
            </p>
            <p className="text-[12px] text-outline truncate max-w-[180px]">
              {email}
            </p>
          </div>
        </div>
      </td>

      {/* ROLE */}
      <td className="px-6 py-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider",
          role === ROLES.ADMIN 
            ? "bg-primary/10 text-primary" 
            : "bg-surface-container-highest text-on-surface-variant"
        )}>
          {role === ROLES.ADMIN ? "Admin" : "Household"}
        </span>
      </td>

      {/* LOCATION */}
      <td className="px-6 py-5 font-body-md text-on-surface-variant">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-outline" />
          <span className="truncate max-w-[150px]">
            {address?.baranggay || "Location unset"}
          </span>
        </div>
      </td>

      {/* DATE JOINED */}
      <td className="px-6 py-5 font-body-md text-on-surface-variant">
        {dateJoined}
      </td>

      {/* STATUS */}
      <td className="px-6 py-5">
        <div className={cn(
          "flex items-center gap-2 font-label-sm text-label-sm",
          isActive ? "text-green-600" : isPending ? "text-orange-500" : "text-red-500"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            isActive ? "bg-green-500" : isPending ? "bg-orange-400" : "bg-red-500"
          )} />
          <span className="capitalize">{status}</span>
        </div>
      </td>

      {/* ACTION */}
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditClick(user)}
            className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-all active:scale-90"
            title="Edit User"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onActionClick(user)}
            className={cn(
              "p-2 rounded-lg transition-all active:scale-90",
              isActive
                ? "text-outline hover:text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            )}
            title={isActive ? "Disable User" : "Enable User"}
          >
            {isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
          </button>
        </div>
      </td>
    </tr>
  );
});

UserTableRow.displayName = "UserTableRow";

// 🏢 ORGANISM: Master User Table Component
export const UserTable = ({ users = [], onActionClick, onEditClick, activeView }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/30">
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">User</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date Joined</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {users.length > 0 ? (
            users.map((user) => (
              <UserTableRow
                key={user.uid || user.id}
                user={user}
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
                    <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">
                      No {activeView}s Found
                    </h3>
                    <p className="text-sm text-on-surface-variant font-medium mt-1 leading-relaxed">
                      Your search or filter criteria didn&apos;t match any system profiles.
                    </p>
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
