import { useState, useMemo, memo, useEffect, useRef } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Filter,
  Cpu,
  CheckCircle2,
  Link,
  Check,
} from "lucide-react";
import { useDevices } from "../../../hooks/useDevices";
import ModalBackdrop from "../ModalBackdrop";
import GlobalSearch from "../../ui/GlobalSearch";
import { cn } from "../../../utils/cn";

// Sub-components
import InfoItem from "./InfoItem";
import SummaryItem from "./SummaryItem";
import DeviceCard from "./DeviceCard";

/**
 * ApproveRequestModal Component
 * Implements the "Assign Device" premium design from 'code1.html'.
 * Used when an admin approves a resident request and needs to link a specific device.
 */
const ApproveRequestModal = ({ isOpen, onClose, request, onConfirm, isSubmitting }) => {
  const { devices: availableDevices, loading: inventoryLoading } = useDevices(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // SORT STATE
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "id"
  const [showSortOptions, setShowSortOptions] = useState(false);
  const sortRef = useRef(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and Sort devices
  const processedDevices = useMemo(() => {
    if (!availableDevices) return [];

    let result = availableDevices.filter(
      (d) =>
        d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === "id") return a.device_id.localeCompare(b.device_id);
      return 0;
    });

    return result;
  }, [availableDevices, searchTerm, sortBy]);

  if (!isOpen || !request) return null;

  const handleClose = () => {
    setSearchTerm("");
    setSelectedDevice(null);
    setShowSortOptions(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedDevice) return;
    onConfirm({ deviceId: selectedDevice.device_id });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ModalBackdrop>
      <div className="bg-white w-full max-w-[720px] rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300 border border-slate-100">
        {/* HEADER */}
        <header className="px-6 py-4 border-b border-slate-50 flex items-start justify-between bg-white sticky top-0 z-10">
          <div className="flex flex-col items-start">
            <div className="flex items-start">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1NkdQZammmvdJiN6PWJirsXDL9quQ4vq_VWyCaCrliJDEZeVF54nrL8n9b1kbCFT2mrak0rrVn5tV4YGhaDZ7MYM_EHKs2k0vnZWEo70hiOb5Fplgq1hsSr-1bySDK-5ZgdabdjtExiZt4Xu4qedSBx6ssluGBH3Y096Jr-MtJCGRe6Uq7P0PNIuQCAX3ajCqda3krGP1lH410NbS_JRlhDwdDgfm3wQ4Dhn50M57xqMfRIuU8yZtPLnJjK13JQv0yiHGtQI3ik4"
                alt="User Icon"
                className="w-10 h-10 object-cover rounded-lg mr-3 mt-1"
              />
              <div className="mt-0.5">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  <span className="text-slate-900">Assign</span>{" "}
                  <span className="text-blue-600">Device</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-medium mt-1 leading-tight max-w-[500px]">
                  Assign an available monitoring device to a household user for real-time voltage
                  and salinity monitoring.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* USER INFORMATION SECTION */}
          <section className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-5 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
              <User size={14} fill="currentColor" className="opacity-80" />
              Household User Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <InfoItem icon={User} label="Name" value={request.residentName} />
              <InfoItem icon={MapPin} label="Location" value={request.residentLocation} />
              <InfoItem icon={Phone} label="Contact Number" value={request.residentMobile} />
              <InfoItem
                icon={Calendar}
                label="Request Date"
                value={formatDate(request.createdAt)}
              />
              <InfoItem icon={Mail} label="Email Address" value={request.residentEmail} isEmail />
              <InfoItem
                icon={Clock}
                label="Current Timestamp"
                value={formatDateTime(currentTime)}
              />
            </div>
          </section>

          {/* DEVICE SELECTION SECTION */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight">
                  Available Devices
                </h2>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                  Select a device to assign to this household.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <GlobalSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeholder="Search by ID, SN, or Name..."
                  variant="minimal"
                  className="w-full md:w-56"
                />

                {/* SORT DROPDOWN */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setShowSortOptions(!showSortOptions)}
                    title="Sort Inventory"
                    className={cn(
                      "p-1.5 border rounded-lg transition-all text-slate-400 shrink-0 h-9 flex items-center justify-center aspect-square hover:bg-slate-50",
                      showSortOptions
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "border-slate-200"
                    )}
                  >
                    <Filter size={16} />
                  </button>

                  {showSortOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                        Sort Inventory
                      </p>
                      <SortOption
                        active={sortBy === "newest"}
                        onClick={() => {
                          setSortBy("newest");
                          setShowSortOptions(false);
                        }}
                        label="Newest Devices"
                      />
                      <SortOption
                        active={sortBy === "oldest"}
                        onClick={() => {
                          setSortBy("oldest");
                          setShowSortOptions(false);
                        }}
                        label="Oldest Devices"
                      />
                      <SortOption
                        active={sortBy === "id"}
                        onClick={() => {
                          setSortBy("id");
                          setShowSortOptions(false);
                        }}
                        label="Sort by Device ID"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DEVICE LIST */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1.5 custom-scrollbar">
              {inventoryLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">
                    Accessing Inventory...
                  </p>
                </div>
              ) : processedDevices.length > 0 ? (
                processedDevices.map((device) => (
                  <DeviceCard
                    key={device.device_id}
                    device={device}
                    isSelected={selectedDevice?.device_id === device.device_id}
                    onSelect={() => setSelectedDevice(device)}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-1.5 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Cpu size={24} strokeWidth={1.5} className="opacity-30" />
                  <p className="text-[11px] font-bold italic">No available devices found.</p>
                </div>
              )}
            </div>
          </section>

          {/* SUMMARY SECTION */}
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
              <Link size={14} className="rotate-45" />
              Assignment Summary
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <SummaryItem label="Selected User" value={request.residentName} />
              <SummaryItem
                label="Selected Device"
                value={selectedDevice?.device_id || "None Selected"}
                highlight={!!selectedDevice}
              />
              <SummaryItem
                label="Location"
                value={request.residentLocation}
                className="col-span-1"
              />
              <SummaryItem label="Assignment Date" value={formatDate(currentTime)} />
              <div className="flex flex-col gap-0.5 items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Status
                </span>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                    selectedDevice
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  )}
                >
                  {selectedDevice ? (
                    <>
                      READY FOR LINK{" "}
                      <CheckCircle2 size={10} fill="currentColor" className="text-white" />
                    </>
                  ) : (
                    "AWAITING SELECTION"
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className="px-6 py-4 border-t border-slate-50 flex items-center justify-end gap-3 bg-white sticky bottom-0 z-10">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all rounded-lg flex items-center gap-2 uppercase tracking-widest"
          >
            <X size={14} />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDevice || isSubmitting}
            className={cn(
              "px-6 py-2 rounded-lg font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95",
              selectedDevice && !isSubmitting
                ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Link size={14} />
                Assign Device
              </>
            )}
          </button>
        </footer>
      </div>
    </ModalBackdrop>
  );
};

/**
 * SortOption Helper Component
 */
const SortOption = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full px-3 py-2 text-left text-[11px] font-bold transition-colors flex items-center justify-between",
      active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
    )}
  >
    {label}
    {active && <Check size={12} />}
  </button>
);

export default memo(ApproveRequestModal);
