import { memo } from "react";
import { MapPin, Edit3, Trash2, RotateCcw } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * ResidentTableRow Component
 * Individual row display and action logic for the Resident table.
 */
const ResidentTableRow = memo(({ resident, onActionClick, onEditClick }) => {
  const {
    firstName = "",
    lastName = "",
    email = "",
    assignedDevice = "No Device",
    address = {},
    createdAt,
    photoURL,
    status = "disabled",
    isOnline,
  } = resident;

  const isActive = status === "active";
  const dateJoined = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
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
              {firstName[0]}
              {lastName[0]}
            </div>
          )}
          <div>
            <p className="font-label-md text-label-md text-on-surface leading-tight">
              {firstName} {lastName}
            </p>
            <p className="text-[12px] text-outline truncate max-w-[180px]">{email}</p>
          </div>
        </div>
      </td>

      {/* DEVICES */}
      <td className="px-6 py-5">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider",
            assignedDevice !== "No Device"
              ? "bg-secondary/10 text-secondary"
              : "bg-slate-100 text-slate-400"
          )}
        >
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
        <div
          className={cn(
            "flex items-center gap-2 font-label-sm text-label-sm",
            isOnline ? "text-green-600" : "text-slate-400"
          )}
        >
          <span
            className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-500" : "bg-slate-300")}
          />
          <span>{isOnline ? "Active" : "Offline"}</span>
        </div>
      </td>

      {/* ACTION */}
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditClick(resident)}
            className="p-2 hover:bg-surface-container-high rounded-lg text-outline transition-all active:scale-90"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onActionClick(resident)}
            className={cn(
              "p-2 rounded-lg transition-all active:scale-90",
              isActive
                ? "text-outline hover:text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            )}
          >
            {isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
          </button>
        </div>
      </td>
    </tr>
  );
});

ResidentTableRow.displayName = "ResidentTableRow";

export default ResidentTableRow;
