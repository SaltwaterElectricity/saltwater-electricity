import { useState, useEffect, useMemo } from "react";
import { subscribeToAllDevices } from "../services/firebaseService";
import { useIsConnected } from "./useIsConnected";

const ONLINE_TIMEOUT_MS = 30000; // 30 seconds

/**
 * 1. PURE TRANSFORMATION LOGIC
 * Extracts "Instant" status without mutating the heavy log data.
 */
const transformDevice = (deviceData, now) => {
  const latest = deviceData?.latest ?? {};
  const timestamp = latest.timestamp ?? 0;

  // Calculate if the device has checked in recently
  const isOnline = now - timestamp < ONLINE_TIMEOUT_MS;

  return {
    ...deviceData,
    // Add derived UI properties
    displayTDS: Number(Number(latest.tds_ppm ?? 0).toFixed(1)),
    isOnline,
    lastSeen: timestamp,
    status: {
      text: isOnline ? "Online" : "Offline",
      color: isOnline ? "bg-emerald-500" : "bg-slate-400",
    },
  };
};

export const useDashboard = () => {
  const [rawDevices, setRawDevices] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const isConnected = useIsConnected();

  // 2. REAL-TIME SUBSCRIPTION
  // Listens to the 'devices' root node defined in firebaseService.js
  useEffect(() => {
    const unsubscribe = subscribeToAllDevices((data) => {
      setRawDevices(data || {});
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 3. STATUS POLLING
  // Forces a re-render every 10s to toggle "Online" -> "Offline" status
  // even if no data is being received from Firebase.
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  // 4. MEMOIZED DATA PROCESSING
  // This prevents the whole dashboard from lagging by only re-processing
  // when the raw Firebase data changes or the 10s "Online" clock ticks.
  const devices = useMemo(() => {
    const processed = {};
    const entries = Object.entries(rawDevices);

    for (const [mac, data] of entries) {
      processed[mac] = transformDevice(data, currentTime);
    }

    return processed;
  }, [rawDevices, currentTime]);

  return {
    devices,
    loading,
    // isReconnecting is true if the browser loses its own internet connection
    isReconnecting: !isConnected,
  };
};
