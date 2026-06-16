import { useState, useMemo, useCallback } from "react";
import { useAuditLogs } from "../../hooks";
import { AuditLogSkeleton } from "../../components/skeleton";

// Modular Components
import {
  AuditLogHeader,
  AuditLogMetrics,
  AuditLogFilters,
  AuditLogTable,
  AuditLogPagination,
} from "../../components/admin/audit-logs";

/**
 * AuditLogPage Component
 * Redesigned security accountability terminal mirroring code1.html.
 */
const AuditLogPage = () => {
  const { logs, loading } = useAuditLogs(500); // Fetch more for filtering

  // --- UI STATES ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- FILTER STATES ---
  const [filters, setFilters] = useState({
    role: "All Roles",
    type: "All Types",
    severity: "All Severity",
    status: "All Status",
  });

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    if (!logs.length) return { total: 0, security: 0, device: 0, failed: 0 };

    const securityCount = logs.filter(
      (l) =>
        l.severity?.toLowerCase() === "high" ||
        l.severity?.toLowerCase() === "critical" ||
        l.action?.toLowerCase().includes("auth") ||
        l.action?.toLowerCase().includes("permission") ||
        l.action?.toLowerCase().includes("security") ||
        l.action?.includes("LOGIN") ||
        l.action?.includes("LOGOUT") ||
        l.action?.includes("ENUMERATION")
    ).length;

    const deviceCount = logs.filter(
      (l) =>
        l.action?.toLowerCase().includes("device") || l.action?.toLowerCase().includes("reading")
    ).length;

    const failedCount = logs.filter(
      (l) => l.status?.toLowerCase() === "failed" || l.action?.includes("FAILURE")
    ).length;

    return {
      total: logs.length,
      security: securityCount,
      securityPercentage: (securityCount / logs.length) * 100,
      device: deviceCount,
      devicePercentage: (deviceCount / logs.length) * 100,
      failed: failedCount,
      failedPercentage: (failedCount / logs.length) * 100,
    };
  }, [logs]);

  // --- FILTERING LOGIC ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Identity Derivation (Sync with AuditLogTableRow logic)
      const firstName = log.firstName?.trim() || "";
      const lastName = log.lastName?.trim() || "";
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

      const isSystem =
        log.adminEmail === "system@saltwaterelectricity.internal" ||
        (log.adminName === "System" && !log.actorUid);
      const isGuest = log.actorUid === "unauthenticated";

      const derivedRole = (
        log.role || (isSystem ? "System" : isGuest ? "Guest" : "User")
      ).toLowerCase();
      const actorName = (
        fullName || (log.adminName && log.adminName !== "System" ? log.adminName : "")
      ).toLowerCase();
      const displayName = (
        actorName ||
        (isGuest ? "unauthenticated guest" : isSystem ? "system" : log.adminEmail || "")
      ).toLowerCase();

      // 1. Search Logic
      const cleanSearch = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !cleanSearch ||
        log.adminEmail?.toLowerCase().includes(cleanSearch) ||
        displayName.includes(cleanSearch) ||
        fullName.includes(cleanSearch) ||
        derivedRole.includes(cleanSearch) ||
        log.action?.toLowerCase().includes(cleanSearch) ||
        log.details?.toLowerCase().includes(cleanSearch) ||
        log.ipAddress?.includes(cleanSearch);

      if (!matchesSearch) return false;

      // 2. Role Filter
      if (filters.role !== "All Roles") {
        const targetRole = filters.role.replace(/\s+/g, "").toLowerCase(); // "Super Admin" -> "superadmin"
        const currentRole = derivedRole.replace(/\s+/g, ""); // "super admin" -> "superadmin"

        // Handle "household" vs "resident" mapping
        if (targetRole === "resident" || targetRole === "householduser") {
          if (currentRole !== "resident" && currentRole !== "household") return false;
        } else if (currentRole !== targetRole) {
          return false;
        }
      }

      // 3. Activity Type Filter (Robust mapping)
      if (filters.type !== "All Types") {
        const action = log.action?.toUpperCase() || "";
        const type = filters.type;

        switch (type) {
          case "Login":
            if (action !== "USER_LOGIN") return false;
            break;
          case "Logout":
            if (action !== "USER_LOGOUT") return false;
            break;
          case "Password Reset":
            if (action !== "PASSWORD_RESET") return false;
            break;
          case "View Readings":
            if (action !== "VIEW_READINGS") return false;
            break;
          case "Device Control":
            if (action !== "RELAY_TOGGLED") return false;
            break;
          case "Assign Device":
            if (action !== "DEVICE_ASSIGNED") return false;
            break;
          case "Deprovision Device":
            if (action !== "DEVICE_DEPROVISIONED") return false;
            break;
          case "Edit Profile":
            if (action !== "PROFILE_UPDATED") return false;
            break;
          case "Device Request":
            if (!action.includes("REQUEST")) return false;
            break;
          case "Security Alert":
            if (
              !action.includes("SECURITY") &&
              action !== "POTENTIAL_ENUMERATION" &&
              action !== "LOGIN_FAILURE"
            )
              return false;
            break;
          case "System Event":
            if (action !== "USER_PROVISIONED") return false;
            break;
          default:
            if (!action.toLowerCase().includes(type.toLowerCase())) return false;
        }
      }

      // 4. Severity Filter
      if (
        filters.severity !== "All Severity" &&
        log.severity?.toLowerCase() !== filters.severity.toLowerCase()
      )
        return false;

      // 5. Status Filter
      if (
        filters.status !== "All Status" &&
        log.status?.toLowerCase() !== filters.status.toLowerCase()
      )
        return false;

      return true;
    });
  }, [logs, searchTerm, filters]);

  // --- PAGINATION LOGIC ---
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, currentPage, logsPerPage]);

  // --- HANDLERS ---
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      role: "All Roles",
      type: "All Types",
      severity: "All Severity",
      status: "All Status",
    });
    setCurrentPage(1);
  }, []);

  if (loading) {
    return <AuditLogSkeleton />;
  }

  return (
    <div className="space-y-4 antialiased font-sans">
      <AuditLogHeader />

      <AuditLogMetrics metrics={metrics} />

      <AuditLogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        onClearFilters={handleClearFilters}
      />

      <AuditLogTable logs={paginatedLogs} loading={loading} />

      <AuditLogPagination
        totalLogs={filteredLogs.length}
        currentPage={currentPage}
        logsPerPage={logsPerPage}
        onPageChange={setCurrentPage}
        onLogsPerPageChange={(val) => {
          setLogsPerPage(val);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default AuditLogPage;
