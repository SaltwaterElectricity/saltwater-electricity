import { useMemo, useState } from "react";
import { useUserSubscription, useAssignments, useDevices } from "./";
import { ROLES } from "../constants/roles";

/**
 * useResidentManagement Hook
 * Centralizes data orchestration, hydration, and filtering for Resident Management.
 */
export const useResidentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Users");
  const [locationFilter, setLocationFilter] = useState("Location");

  // 1. Fetch Core Data
  const {
    data: residents = [],
    loading: usersLoading,
    error,
  } = useUserSubscription(ROLES.RESIDENT);
  const { assignments: assignmentsObj = {} } = useAssignments();
  const { devices = [], telemetry = {} } = useDevices();

  // Use state initializer to get a stable 'now' value for this render cycle without triggering purity warnings
  const [now] = useState(() => Date.now());

  // 2. Hydrate Residents with Device/Telemetry Data
  const hydratedResidents = useMemo(() => {
    // FIX: Correctly map deviceId from the keys of assignmentsObj
    const assignments = Object.entries(assignmentsObj).map(([deviceId, data]) => ({
      ...data,
      deviceId,
    }));

    // 2a. Map existing residents
    const residentsMap = residents.map((res) => {
      const assignment = assignments.find((a) => a.userId === res.id);
      const device = assignment ? devices.find((d) => d.device_id === assignment.deviceId) : null;
      const tel = device ? telemetry[device.device_id] : null;

      // Determine if online (last 5 mins)
      const isOnline = tel && tel.timestamp && now - tel.timestamp < 300000;

      return {
        ...res,
        deviceId: assignment?.deviceId || null,
        assignedAt: assignment?.assignedAt || null,
        assignedDevice: device ? device.device_name || device.device_id : "No Device",
        isOnline: !!isOnline,
      };
    });

    // 2b. Include Orphaned Assignments (Devices assigned to UIDs missing from the users list)
    const assignedUserIds = new Set(residents.map((r) => r.id));
    const orphans = assignments.filter((a) => !assignedUserIds.has(a.userId));

    const orphanedResidents = orphans.map((a) => {
      const device = devices.find((d) => d.device_id === a.deviceId);
      const tel = device ? telemetry[device.device_id] : null;
      const isOnline = tel && tel.timestamp && now - tel.timestamp < 300000;

      // Extract name from device_information if profile is missing
      const fullName = device?.assigned_user_name || "Unknown Resident";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.slice(1).join(" ") || "";

      return {
        id: a.userId,
        uid: a.userId,
        firstName,
        lastName,
        email: "Profile missing",
        deviceId: a.deviceId,
        assignedAt: a.assignedAt,
        assignedDevice: device ? device.device_name || device.device_id : "No Device",
        isOnline: !!isOnline,
        address: { baranggay: "Unknown" },
        status: "disabled", // Orphaned users are treated as disabled/inactive
      };
    });

    return [...residentsMap, ...orphanedResidents];
  }, [residents, assignmentsObj, devices, telemetry, now]);

  // 3. Compute Stats
  const stats = useMemo(() => {
    const online = hydratedResidents.filter((r) => r.isOnline).length;
    const offline = hydratedResidents.length - online;
    return {
      total: hydratedResidents.length,
      online,
      offline,
    };
  }, [hydratedResidents]);

  // 4. Apply Filters
  const filteredResidents = useMemo(() => {
    return hydratedResidents.filter((r) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) || (r.email || "").toLowerCase().includes(searchLower);

      // Status/Online
      const matchesStatus =
        statusFilter === "All Users" ||
        (statusFilter === "Online Residents" && r.isOnline) ||
        (statusFilter === "Offline Residents" && !r.isOnline);

      // Location
      const userLocation = r.address?.baranggay || "";
      const matchesLocation = locationFilter === "Location" || userLocation === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [hydratedResidents, searchTerm, statusFilter, locationFilter]);

  return {
    residents: filteredResidents,
    allResidents: hydratedResidents,
    stats,
    loading: usersLoading,
    error,
    filters: {
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      locationFilter,
      setLocationFilter,
    },
  };
};
