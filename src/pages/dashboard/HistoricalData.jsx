import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../styles/historical-legacy.css";
import {
  HistoricalHeader,
  HistoricalMetricCards,
  HistoricalFilterBar,
  HistoricalCharts,
  HistoricalTable,
} from "../../components/dashboard";
import { 
  useDevices, 
  useResidentManagement, 
  useHistory, 
  useMultiDeviceHistory 
} from "../../hooks";

/**
 * HistoricalData Page - Unified Legacy Mirror
 * 
 * This page serves as the main orchestrator for historical IoT data.
 * It handles multi-device aggregation, user hydration, and complex filtering.
 * Mirrored from legacy design code1.html.
 */
const HistoricalData = () => {
  const { deviceId } = useParams();

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
  const { residents, stats: residentStats, loading: residentsLoading } = useResidentManagement();
  
  // Create device -> user ID mapping for efficient lookup
  const deviceUserMap = useMemo(() => {
    return (devices || []).reduce((acc, dev) => {
      acc[dev.device_id] = dev.assigned_user_id;
      return acc;
    }, {});
  }, [devices]);

  // --- 3. Data Strategy: Single vs Multi View ---
  const isAllSelected = selectedDeviceId === "all";
  
  // A. Single device history branch
  const { logs: singleLogs, loading: singleLoading } = useHistory(
    !isAllSelected ? selectedDeviceId : null, 
    100, 
    dateFilter
  );

  // B. Multi device history branch (aggregate view)
  const allDeviceIds = useMemo(() => devices.map(d => d.device_id), [devices]);
  const { data: multiHistory, loading: multiLoading } = useMultiDeviceHistory(
    isAllSelected ? allDeviceIds : [],
    20 // Fetch limited set per device for overview performance
  );

  // --- 4. Transformation: Flatten and Sort Logs ---
  const activeLogs = useMemo(() => {
    if (!isAllSelected) {
      // Branch: Process single device logs
      return singleLogs.map(log => ({
        ...log,
        deviceId: selectedDeviceId,
        userId: deviceUserMap[selectedDeviceId]
      }));
    }
    
    // Branch: Flatten multi-device history into a single linear timeline
    const flattened = [];
    
    multiHistory.forEach(entry => {
      allDeviceIds.forEach(id => {
        if (entry[`${id}_full`]) {
          flattened.push({
            id: `${id}-${entry.timestamp}`,
            deviceId: id,
            userId: deviceUserMap[id], // Hydrate user context
            ...entry[`${id}_full`],
            __normalizedTs: entry.timestamp
          });
        }
      });
    });
    
    // Maintain chronological integrity (newest first)
    return flattened.sort((a, b) => b.__normalizedTs - a.__normalizedTs);
  }, [isAllSelected, singleLogs, multiHistory, allDeviceIds, selectedDeviceId, deviceUserMap]);

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
    
    return activeLogs.filter(log => {
      const user = residentsMap[log.userId] || {};
      const userName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const userEmail = (user.email || "").toLowerCase();
      const deviceName = (log.deviceId || "").toLowerCase();
      const location = (user.address?.baranggay || "").toLowerCase();
      
      return userName.includes(term) || 
             userEmail.includes(term) || 
             deviceName.includes(term) || 
             location.includes(term);
    });
  }, [activeLogs, searchTerm, residentsMap]);

  // --- 7. Loading Orchestration ---
  const isLoading = devicesLoading || residentsLoading || (isAllSelected ? multiLoading : singleLoading);

  // --- 8. Render: Unified Layout ---
  return (
    <div className="animate-fade-in historical-legacy-container -mx-gutter md:-mx-margin -mt-gutter md:-mt-margin bg-background min-h-full overflow-x-hidden">
        {/* Mirroring code1.html <main> content area */}
        
        {/* 1. Header with Illustration */}
        <HistoricalHeader 
          onSearch={setSearchTerm} 
        />
        
        {/* 2. Metric Cards Row */}
        <HistoricalMetricCards 
          devicesCount={devices.length}
          usersCount={residentStats.total}
          logsCount={activeLogs.length}
        />
        
        {/* 3. Filter Bar */}
        <HistoricalFilterBar 
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onDeviceChange={setSelectedDeviceId}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />
        
        {/* 4. Charts Grid (Trends & Sidebar Usage) */}
        <HistoricalCharts 
          logs={filteredLogs} 
          loading={isLoading} 
        />
        
        {/* 5. Historical Data Records Table */}
        <HistoricalTable 
          logs={filteredLogs} 
          residentsMap={residentsMap}
          loading={isLoading}
        />
        
        {/* Padding at the bottom to match layout spacing */}
        <div className="h-xl" />
    </div>
  );
};

export default HistoricalData;


