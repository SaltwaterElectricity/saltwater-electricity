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
    const assignments = Object.values(assignmentsObj);

    return residents.map((res) => {
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
