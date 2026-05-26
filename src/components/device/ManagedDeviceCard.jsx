import { useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAssignmentDetails } from "../../hooks/useAssignmentDetails";
import { DeviceDetailsModal } from "../modal";

export const ManagedDeviceCard = ({ device, onAssignClick, onForceRelease, isAdmin }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isAvailable = device.availability === "available";
  const assignmentDetails = useAssignmentDetails(device.device_id);
  const { fullName, loading } = assignmentDetails;

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-[1.5px] p-6 relative overflow-hidden flex flex-col items-center hover:shadow-xl transition-all duration-300 bg-white",
        isAvailable ? "border-blue-200" : "border-slate-200"
      )}
    >
      {/* Logo/Icon Header */}
      <div className="absolute top-4 left-4">
        <div className="bg-white border border-blue-100 flex flex-col items-center justify-center shadow-sm w-12 h-12 p-2 rounded-xl">
          <img
            alt="Device Icon"
            className="w-10 h-10 object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUDfiBeldQ_VR_ACyg5kToBbfu8cYVsSY8LzrhRwvMaCDqX8cu6NnvpU1LSNvfI1QxxkRRrX5cy-R_Wxq1LhajmUi_iX1_UW8B6QtjkiQ9XvoP_IxdyZ7147XwjNRh0vif3OZEBDQeeUh-anwgX5kHbTUB1_w3qtHIxx4j37RXi4LlsB-_cDW6bfA2Duoj4rQu5neJIPQBfAmJspgUvS5si0goEjbBuLO6-18JvyQs_XWBKBL55MrzF6UvThPkOW5-En5044hkicBzyA"
          />
        </div>
      </div>

      <div className="flex flex-col items-center w-full pt-12 space-y-6">
        {/* Status Badge */}
        <div className="mt-2">
          {isAvailable ? (
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-[#e7f6ed] text-[#2d8a4e] rounded-full font-bold text-sm border border-[#c1e8d0]">
              <span className="w-2 h-2 bg-[#2d8a4e] rounded-full" />
              Available !
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-sm border border-blue-100">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              Assigned
            </span>
          )}
        </div>

        {/* Device ID and Name */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-[#1e293b] leading-tight truncate max-w-[240px]">
            {device.device_name || "Unnamed"}
          </h2>
          <p className="text-xl text-[#64748b]">ID: {device.device_id}</p>
        </div>

        {/* Visual Divider */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-[1.5px] bg-blue-100" />
          <div className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="flex-1 h-[1.5px] bg-blue-100" />
        </div>

        {/* Conditional Content: Assignment Details or Action */}
        {!isAvailable && (
          <div className="w-full flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
              {loading ? "..." : getInitials(fullName)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Assigned To
              </p>
              <p className="text-sm text-slate-900 font-semibold truncate max-w-[150px]">
                {loading ? "Loading..." : fullName || "Unknown Resident"}
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full space-y-3">
          {isAvailable ? (
            <button
              onClick={() => onAssignClick(device)}
              className="w-full py-4 bg-[#1d63ff] text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors uppercase tracking-wider active:scale-95"
            >
              ASSIGN NOW
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setIsDetailsOpen(true)}
                className="flex-1 py-3 bg-[#1d63ff] text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2"
              >
                <Eye size={14} />
                VIEW DETAILS
              </button>
              {isAdmin && (
                <button
                  onClick={() => onForceRelease(device.device_id)}
                  className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2"
                >
                  Unassigned
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <DeviceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        device={device}
        assignmentDetails={assignmentDetails}
        isAdmin={isAdmin}
        onUnassign={onForceRelease}
      />
    </div>
  );
};
