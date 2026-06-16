import { useState, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { useDevices, useAssignments, useUserSubscription } from "../../hooks";
import { MonitorSkeleton } from "../../components/skeleton";
import {
  MonitorHeader,
  MonitorStats,
  MonitorMetrics,
  MonitorFilters,
  MonitorDeviceRow,
  MonitorSidePanel,
} from "../../components/admin/real-time-monitor";

/**
 * PAGE: AdminRealTimeMonitor
 * Mirrored from code1.html.
 * Orchestrates the real-time monitoring of all decentralized infrastructure nodes.
 */
const AdminRealTimeMonitor = () => {
  const { devices, telemetry, loading: devicesLoading } = useDevices();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  const { data: users, loading: usersLoading } = useUserSubscription();

  // --- UI STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [activeTab, setActiveTab] = useState("readings"); // 'overview' | 'readings' | 'alerts'
  // --- DERIVED DATA ---
  const hydratedDevices = useMemo(() => {
    if (!devices || !assignments || !users) return [];

    // We capture 'now' once per memo calculation to maintain consistency across the loop
    const now = new Date().getTime();

    return devices.map((device) => {
      const assignment = assignments[device.device_id];
      const resident = users.find((u) => u.id === assignment?.userId);
      const tel = telemetry?.[device.device_id] || {};

      const isOnline = tel.timestamp && now - tel.timestamp < 300000; // 5 mins threshold

      // Determine status based on telemetry thresholds and maintenance flag
      let status = "Offline";
      if (isOnline) {
        // Warning if maintenance is required or if values are outside nominal range
        const tdsValue = tel.tds ?? tel.tds_ppm ?? 0;
        const isWarning =
          tel.is_maintenance || tdsValue > 800 || tel.voltage > 250 || tel.voltage < 210;

        status = isWarning ? "Warning" : "Online";
      }

      return {
        ...device,
        residentName: resident ? `${resident.firstName} ${resident.lastName}` : "Unassigned Unit",
        residentEmail: resident?.email || "No email linked",
        residentPhone: resident?.mobileNum || "No contact info",
        residentLocation: resident?.address?.baranggay || "Unassigned Location",
        telemetry: tel,
        isOnline,
        status,
      };
    });
  }, [devices, assignments, users, telemetry]);

  const filteredDevices = useMemo(() => {
    return hydratedDevices.filter((d) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        d.device_id.toLowerCase().includes(searchLower) ||
        d.residentName.toLowerCase().includes(searchLower);

      const matchesLocation =
        locationFilter === "All Locations" || d.residentLocation === locationFilter;
      const matchesStatus = statusFilter === "Status" || d.status === statusFilter;

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [hydratedDevices, searchTerm, locationFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalVoltage = hydratedDevices.reduce((acc, d) => acc + (d.telemetry?.voltage || 0), 0);
    const totalSalinity = hydratedDevices.reduce(
      (acc, d) => acc + (d.telemetry?.tds || d.telemetry?.tds_ppm || 0),
      0
    );
    const online = hydratedDevices.filter((d) => d.isOnline).length;
    const offline = hydratedDevices.length - online;

    return {
      totalVoltage,
      totalSalinity,
      total: hydratedDevices.length,
      online,
      offline,
      health: hydratedDevices.length > 0 ? Math.round((online / hydratedDevices.length) * 100) : 0,
    };
  }, [hydratedDevices]);

  const selectedDevice = useMemo(() => {
    return hydratedDevices.find((d) => d.device_id === selectedDeviceId);
  }, [hydratedDevices, selectedDeviceId]);

  const locations = useMemo(() => {
    const locs = new Set(hydratedDevices.map((d) => d.residentLocation));
    return ["All Locations", ...Array.from(locs).filter((l) => l !== "Unassigned Location")];
  }, [hydratedDevices]);

  // --- HANDLERS ---
  const handleViewDevice = useCallback((id) => {
    setSelectedDeviceId(id);
    setIsSidePanelOpen(true);
  }, []);

  const closeSidePanel = useCallback(() => {
    setIsSidePanelOpen(false);
    setTimeout(() => setSelectedDeviceId(null), 300);
  }, []);

  const isLoading = devicesLoading || assignmentsLoading || usersLoading;

  if (isLoading) {
    return <MonitorSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col h-full relative overflow-hidden transition-all-custom animate-fade-in">
        {/* 1. HEADER SECTION */}
        <MonitorHeader />

        {/* 2. TOP SUMMARY CARDS (Large Horizontal) */}
        <MonitorStats stats={stats} />

        {/* 3. BOTTOM SUMMARY CARDS (Small Metric Cards) */}
        <MonitorMetrics stats={stats} />

        {/* 4. FILTERS */}
        <MonitorFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          locations={locations}
        />

        {/* 5. DEVICE LIST (The Data Stream) */}
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
          {filteredDevices.map((device) => (
            <MonitorDeviceRow
              key={device.device_id}
              device={device}
              onView={() => handleViewDevice(device.device_id)}
            />
          ))}
          {filteredDevices.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[24px] border-2 border-dashed border-slate-200">
              <Info className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                No nodes match the filter spectrum
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 6. ANALYTICS SIDE PANEL (Overlay) - Moved outside the animated container to escape its stacking context */}
      <MonitorSidePanel
        isOpen={isSidePanelOpen}
        onClose={closeSidePanel}
        device={selectedDevice}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
};

export default AdminRealTimeMonitor;
