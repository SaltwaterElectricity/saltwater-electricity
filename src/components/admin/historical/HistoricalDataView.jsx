import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/historical-legacy.css";
import {
  HistoricalHeader,
  HistoricalMetricCards,
  HistoricalFilterBar,
  HistoricalCharts,
  HistoricalTable,
} from "../../../components";
import {
  useDevices,
  useResidentManagement,
  useHistory,
  useMultiDeviceHistory,
  useAssignments,
} from "../../../hooks";
import { useAuth } from "../../../context/useAuth";

/**
 * HistoricalData Page - Unified Legacy Mirror
 *
 * This page serves as the main orchestrator for historical IoT data.
 * It handles multi-device aggregation, user hydration, and complex filtering.
 * Mirrored from legacy design code1.html.
 */
const HistoricalData = () => {
  const { deviceId } = useParams();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const isPrivileged = isAdmin || isSuperAdmin;

  // --- 1. State: UI & Filtering ---
  const [selectedDeviceId, setSelectedDeviceId] = useState(deviceId || "all");
  const [dateFilter, setDateFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sync state if URL parameter changes (e.g. via navigation)
  const [prevDeviceId, setPrevDeviceId] = useState(deviceId);
  if (deviceId !== prevDeviceId) {
    setPrevDeviceId(deviceId);
    setSelectedDeviceId(deviceId || "all");
  }

  // --- 2. Core Data Fetching ---
  const { devices, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { residents, stats: residentStats, loading: residentsLoading } = useResidentManagement();

  // Create device -> user ID mapping for efficient lookup
  const deviceUserMap = useMemo(() => {
    return (devices || []).reduce((acc, dev) => {
      acc[dev.device_id] = dev.assigned_user_id;
      return acc;
    }, {});
  }, [devices]);

  // Find all devices assigned to the current resident
  const userDevices = useMemo(() => {
    if (!user || !devices) return [];
    const userId = String(user.uid || user.id || "");
    if (!userId) return [];

    // 1. Identify IDs from primary assignment node
    const assignedIds = assignments
      ? Object.entries(assignments)
          .filter(([_, data]) => String(data.userId) === userId)
          .map(([id]) => id)
      : [];

    // 2. Filter devices that either have the direct ID match or the legacy field match
    return devices.filter((d) => {
      const isPrimaryMatch = assignedIds.includes(d.device_id);
      const isLegacyMatch = String(d.assigned_user_id || "") === userId;
      return isPrimaryMatch || isLegacyMatch;
    });
  }, [user, devices, assignments]);

  // --- 3. Data Strategy: Single vs Multi View ---
  const isAllSelected = selectedDeviceId === "all";

  // A. Single device history branch
  const {
    logs: singleLogs,
    loading: singleLoading,
    refresh: singleRefresh,
  } = useHistory(!isAllSelected ? selectedDeviceId : null, 100, dateFilter);

  // B. Multi device history branch (aggregate view)
  // STRATEGY: Residents only fetch logs for THEIR devices to avoid Permission Denied errors
  const deviceIdsToFetch = useMemo(() => {
    if (isPrivileged) return devices.map((d) => d.device_id);
    return userDevices.map((d) => d.device_id);
  }, [isPrivileged, devices, userDevices]);

  const {
    data: multiHistory,
    loading: multiLoading,
    refresh: multiRefresh,
  } = useMultiDeviceHistory(
    isAllSelected ? deviceIdsToFetch : [],
    20 // Fetch limited set per device for overview performance
  );

  // --- 4. Transformation: Flatten and Sort Logs ---
  const activeLogs = useMemo(() => {
    if (!isAllSelected) {
      // Branch: Process single device logs
      return singleLogs.map((log) => ({
        ...log,
        deviceId: selectedDeviceId,
        userId: deviceUserMap[selectedDeviceId],
      }));
    }

    // Branch: Flatten multi-device history into a single linear timeline
    const flattened = [];

    multiHistory.forEach((entry) => {
      deviceIdsToFetch.forEach((id) => {
        if (entry[`${id}_full`]) {
          flattened.push({
            id: `${id}-${entry.timestamp}`,
            deviceId: id,
            userId: deviceUserMap[id], // Hydrate user context
            ...entry[`${id}_full`],
            __normalizedTs: entry.timestamp,
          });
        }
      });
    });

    // Maintain chronological integrity (newest first)
    return flattened.sort((a, b) => b.__normalizedTs - a.__normalizedTs);
  }, [isAllSelected, singleLogs, multiHistory, deviceIdsToFetch, selectedDeviceId, deviceUserMap]);

  // --- 5. User Hydration: Resident Mapping ---
  const residentsMap = useMemo(() => {
    return (residents || []).reduce((acc, res) => {
      acc[res.id] = res;
      return acc;
    }, {});
  }, [residents]);

  // --- 6. Final Pass: Search Filtering ---
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return activeLogs;

    const term = searchTerm.toLowerCase();

    return activeLogs.filter((log) => {
      const u = residentsMap[log.userId] || {};
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const userEmail = (u.email || "").toLowerCase();
      const deviceName = (log.deviceId || "").toLowerCase();
      const location = (u.address?.baranggay || "").toLowerCase();

      return (
        fullName.includes(term) ||
        userEmail.includes(term) ||
        deviceName.includes(term) ||
        location.includes(term)
      );
    });
  }, [activeLogs, searchTerm, residentsMap]);

  // --- 7. Metric Calculation (Actual Data) ---
  const readingStats = useMemo(() => {
    return (filteredLogs || []).reduce(
      (acc, log) => {
        if (log.voltage > 0) acc.v++;
        if ((log.tds || log.tds_ppm) > 0) acc.s++;
        if (log.current > 0) acc.c++;
        return acc;
      },
      { v: 0, s: 0, c: 0 }
    );
  }, [filteredLogs]);

  // --- 8. Loading Orchestration ---
  const isLoading =
    devicesLoading ||
    residentsLoading ||
    assignmentsLoading ||
    (isAllSelected ? multiLoading : singleLoading);

  // --- 9. Render: Unified Layout ---
  return (
    <div className="animate-fade-in historical-legacy-container bg-background min-h-full overflow-x-hidden flex flex-col pb-20">
      {/* Mirroring code1.html <main> content area */}

      {/* 1. Header (Condensed vertical padding) */}
      <HistoricalHeader />

      {/* 2. Metric Cards Row (Floating overlap removed for decompression) */}
      <div className="mt-6">
        <HistoricalMetricCards
          devicesCount={isPrivileged ? devices?.length || 0 : userDevices?.length || 0}
          usersCount={isPrivileged ? residentStats?.total || 0 : userDevices.length > 0 ? 1 : 0}
          vCount={readingStats.v}
          sCount={readingStats.s}
          cCount={readingStats.c}
        />
      </div>

      {/* 3. Filter Bar (Clear separation) */}
      <div className="mt-6">
        <HistoricalFilterBar
          devices={isPrivileged ? devices : userDevices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
      </div>

      {/* 4. Charts Grid (Primary focus) */}
      <div className="mt-6">
        <HistoricalCharts logs={filteredLogs} loading={isLoading} />
      </div>

      {/* 5. Historical Data Records Table (Detailed drill-down) */}
      <div className="mt-8">
        <HistoricalTable
          logs={filteredLogs}
          residentsMap={residentsMap}
          loading={isLoading}
          onRefresh={isAllSelected ? multiRefresh : singleRefresh}
        />
      </div>
    </div>
  );
};

export default HistoricalData;
