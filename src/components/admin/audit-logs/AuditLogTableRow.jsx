import { memo, useState, Fragment } from "react";
import {
  Calendar,
  Clock,
  ChevronDown,
  Cpu,
  ShieldAlert,
  Fingerprint,
  Target,
  Terminal,
} from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * ACTION_DISPLAY_MAP
 * Translates technical backend action strings into human-friendly labels.
 */
const ACTION_DISPLAY_MAP = {
  POTENTIAL_ENUMERATION: "Unauthorized Path Access",
  LOGIN_FAILURE: "Failed Login Attempt",
  USER_LOGIN: "User Session Started",
  USER_LOGOUT: "User Session Ended",
  PASSWORD_RESET: "Password Security Update",
  VIEW_READINGS: "Telemetry Data Access",
  DEVICE_ASSIGNED: "Device Allocation",
  DEVICE_DEPROVISIONED: "Device Decommissioned",
  PROFILE_UPDATED: "Account Profile Update",
  USER_PROVISIONED: "User Account Created",
  DEVICE_REQUESTED: "New Device Request",
  REQUEST_CANCELLED: "Device Request Cancelled",
  request_approved: "Device Request Approved",
  request_declined: "Device Request Declined",
  RELAY_TOGGLED: "Remote Hardware Control",
};

/**
 * ROLE_DISPLAY_MAP
 * Formats technical role strings into user-friendly labels.
 */
const ROLE_DISPLAY_MAP = {
  superAdmin: "Super Admin",
  admin: "Admin",
  resident: "Resident",
  household: "Resident",
  System: "System",
};

/**
 * AuditLogTableRow Component
 * Represents a single row in the audit log table with high-fidelity badges and icons.
 * Includes an expandable detail view for technical metadata.
 */
const AuditLogTableRow = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. Identity Derivation (High Resilience)
  const firstName = (log.firstName || "").trim();
  const lastName = (log.lastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  // Actor Email: Priority to hydrated adminEmail, then raw adminEmail
  const actorEmail = log.adminEmail || "N/A";

  // System/Guest Flags
  const isSystemAccount =
    actorEmail === "system@saltwaterelectricity.internal" || log.adminName === "System";
  const isGuest = log.actorUid === "unauthenticated";

  // Display Name Priority: Full Name -> Log Admin Name -> Email -> System/Guest Labels
  const displayName =
    fullName ||
    (log.adminName && log.adminName !== "System" ? log.adminName : null) ||
    (isGuest ? "Unauthenticated Guest" : null) ||
    (isSystemAccount
      ? log.action?.includes("DEVICE") || log.action?.includes("RELAY")
        ? log.targetId || "IoT System"
        : "System Automated Action"
      : null) ||
    actorEmail;

  // 2. Role Derivation
  const getDisplayRole = (role) => {
    const rawRole = role || (isSystemAccount ? "System" : isGuest ? "Guest" : "User");
    const key = rawRole.toLowerCase().trim();

    if (key === "superadmin") return ROLE_DISPLAY_MAP.superAdmin;
    if (key === "admin") return ROLE_DISPLAY_MAP.admin;
    if (key === "resident" || key === "household") return ROLE_DISPLAY_MAP.resident;

    return ROLE_DISPLAY_MAP[rawRole] || rawRole;
  };

  const displayRole = getDisplayRole(log.role);

  // 3. Action Translation
  const displayAction = ACTION_DISPLAY_MAP[log.action] || log.action?.replace(/_/g, " ");

  return (
    <Fragment>
      <tr
        className={cn(
          "hover:bg-gray-50/50 transition-colors cursor-pointer",
          isExpanded && "bg-blue-50/30"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Identity Column */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden",
                isSystemAccount && !fullName ? "bg-slate-100 text-slate-400" : "bg-blue-50"
              )}
            >
              {isSystemAccount && !fullName ? (
                <Cpu size={14} />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=eff6ff&color=2563eb&bold=true`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              {/* Show email subtext if it's different from display name and not system default */}
              {displayName !== actorEmail && actorEmail !== "N/A" && (
                <p className="text-[10px] text-gray-400 truncate leading-none mt-0.5">
                  {actorEmail}
                </p>
              )}
            </div>
          </div>
        </td>

        {/* Role Badge Column */}
        <td className="px-6 py-4">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
              displayRole === "Super Admin" && "bg-purple-50 text-purple-700 border-purple-100",
              displayRole === "Admin" && "bg-blue-50 text-blue-700 border-blue-100",
              displayRole === "Resident" && "bg-emerald-50 text-emerald-700 border-emerald-100",
              (displayRole === "System" || displayRole === "Guest" || displayRole === "User") &&
                "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {displayRole}
          </span>
        </td>

        {/* Action */}
        <td className="px-6 py-4 text-xs">
          <div className="max-w-[240px]">
            <span className="text-slate-700 leading-tight font-bold block">{displayAction}</span>
            <span className="text-[10px] text-slate-400 block truncate italic" title={log.details}>
              {log.details}
            </span>
          </div>
        </td>

        {/* Status Badge */}
        <td className="px-6 py-4">
          <StatusBadge status={log.status || "success"} />
        </td>

        {/* Severity Badge */}
        <td className="px-6 py-4">
          <SeverityBadge severity={log.severity || "informational"} />
        </td>

        {/* IP Address */}
        <td className="px-6 py-4 text-xs text-gray-500 font-medium font-mono">
          {log.ipAddress || "Terminal"}
        </td>

        {/* Date & Time */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Calendar size={14} className="text-gray-400" />
            {new Date(log.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            <Clock size={14} className="text-gray-400 ml-2" />
            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </td>

        {/* Row Actions */}
        <td className="px-6 py-4 text-gray-400">
          <div className="flex justify-center">
            <button
              className={cn(
                "p-1.5 hover:bg-gray-100 rounded-full transition-all text-gray-500 active:scale-95",
                isExpanded && "rotate-180 bg-blue-100 text-primary"
              )}
              title="View Full Details"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expandable Detail View */}
      {isExpanded && (
        <tr className="bg-gray-50/50">
          <td colSpan="8" className="px-6 py-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Technical Context */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Actor Identity
                </p>
                <DetailItem icon={Fingerprint} label="First Name" value={firstName || "N/A"} />
                <DetailItem icon={Fingerprint} label="Last Name" value={lastName || "N/A"} />
                <DetailItem icon={ShieldAlert} label="Assigned Role" value={displayRole} />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Technical Context
                </p>
                <DetailItem
                  icon={Fingerprint}
                  label="Actor UID"
                  value={log.actorUid || "N/A"}
                  mono
                />
                <DetailItem icon={Target} label="Target ID" value={log.targetId || "N/A"} mono />
                <DetailItem
                  icon={Terminal}
                  label="Client Node"
                  value={log.ipAddress || "Internal System"}
                  mono
                />
              </div>

              {/* Event details */}
              <div className="col-span-2 space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Full Narrative
                </p>
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <p className="text-xs leading-relaxed text-slate-600 font-medium italic">
                    &quot;{log.details}&quot;
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    Recorded At:{" "}
                    <span className="text-slate-600 ml-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    Log Hash: <span className="text-slate-600 ml-1 font-mono">{log.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
};

const DetailItem = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm shrink-0">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
        {label}
      </p>
      <p className={cn("text-[11px] font-bold text-slate-700 truncate", mono && "font-mono")}>
        {value}
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const normalized = status.toLowerCase();
  const styles = {
    success: "bg-[#ecfdf5] text-[#059669] border-[#d1fae5]",
    failed: "bg-[#fef2f2] text-[#dc2626] border-[#fee2e2]",
    warning: "bg-[#fffbeb] text-[#d97706] border-[#fef3c7]",
    blocked: "bg-slate-900 text-white border-slate-900",
    pending: "bg-blue-50 text-blue-600 border-blue-100",
  };

  const dotColors = {
    success: "bg-green-500",
    failed: "bg-red-500",
    warning: "bg-amber-500",
    blocked: "bg-white",
    pending: "bg-blue-500",
  };

  const style = styles[normalized] || styles.success;
  const dotColor = dotColors[normalized] || dotColors.success;

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 w-fit border capitalize",
        style
      )}
    >
      {normalized === "warning" ? (
        <ShieldAlert size={12} />
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      )}
      {status}
    </span>
  );
};

const SeverityBadge = ({ severity }) => {
  const normalized = severity.toLowerCase();
  const styles = {
    critical: "bg-[#450a0a] text-white",
    high: "bg-[#fff1f2] text-[#e11d48]",
    medium: "bg-[#fff7ed] text-[#ea580c]",
    low: "bg-[#eff6ff] text-[#2563eb]",
    informational: "bg-[#f0f9ff] text-[#0891b2]",
  };

  const dotColors = {
    critical: "bg-white",
    high: "bg-red-600",
    medium: "bg-orange-500",
    low: "bg-blue-500",
    informational: "bg-cyan-500",
  };

  const style = styles[normalized] || styles.informational;
  const dotColor = dotColors[normalized] || dotColors.informational;

  return (
    <span
      className={cn(
        "px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 w-fit capitalize",
        style
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      {severity}
    </span>
  );
};

export default memo(AuditLogTableRow);
