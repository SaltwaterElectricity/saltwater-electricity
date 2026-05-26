import { useState, memo, useMemo, useEffect } from "react";
import {
  X,
  Cpu,
  Minus,
  Plus,
  Calendar,
  MapPin,
  Phone,
  Send,
  RotateCcw,
  Info,
  PackageOpen,
} from "lucide-react";
import { createDeviceRequest } from "../../services/request.service";
import ModalBackdrop from "./ModalBackdrop";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/useAuth";
import { useDevices } from "../../hooks/useDevices";

const DeviceRequestModal = ({ isOpen, onClose, onShowToast }) => {
  const { user } = useAuth();
  const { devices: availableDevices, loading: inventoryLoading } = useDevices(true);
  const availableCount = availableDevices.length;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return "No Address Provided";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.baranggay, addr.cityProvince, addr.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Invalid Address Format";
  };

  const initialFormState = useMemo(
    () => ({
      quantity: availableCount > 0 ? 1 : 0,
      requestType: "Request for Another Device.",
      address: formatAddress(user?.address),
      phoneNumber: user?.phone || user?.phoneNumber || "N/A",
      reason: "",
    }),
    [user, availableCount]
  );

  const [formData, setFormData] = useState(initialFormState);

  // Sync state if user or availableCount changes while open
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        address: formatAddress(user?.address),
        phoneNumber: user?.phone || user?.phoneNumber || "N/A",
        quantity:
          prev.quantity === 0 && availableCount > 0 ? 1 : Math.min(prev.quantity, availableCount),
      }));
    }
  }, [user, availableCount, isOpen]);

  const timestamp = useMemo(() => {
    return new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData(initialFormState);
    onClose();
  };

  const handleClear = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (availableCount === 0) {
      onShowToast("No devices currently available for request.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createDeviceRequest({
        deviceName: `Additional Unit (${formData.quantity}x)`,
        requestType: formData.requestType,
        quantity: formData.quantity,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        reason: formData.reason,
      });
      onShowToast("Request submitted successfully.", "success");
      handleClose();
    } catch (error) {
      onShowToast(error.message || "Failed to submit request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const displayAddress = formData.address;

  return (
    <ModalBackdrop>
      <div className="bg-white w-full max-w-[750px] rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        {/* MODAL HEADER */}
        <div className="px-8 py-6 flex justify-between items-start relative border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Request <span className="text-blue-600">Another Device</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Fill out the form below to request an additional monitoring device for your household.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar px-8 py-6 space-y-8">
          {/* USER PROFILE CARD */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center font-bold text-blue-600 text-lg">
                {getInitials(user?.firstName, user?.lastName) || "JH"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-none">
                  {user?.firstName} {user?.lastName}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">{user?.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-600/20 rounded-md">
              {user?.role || "Household User"}
            </span>
          </div>

          <form id="deviceRequestForm" onSubmit={handleSubmit} className="space-y-8">
            {/* FORM SECTION: GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Request Type
                  </label>
                  <div className="relative">
                    <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none"
                      readOnly
                      value={formData.requestType}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Quantity
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                      <PackageOpen size={12} />
                      {inventoryLoading ? "Checking..." : `${availableCount} Available`}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center border rounded-xl overflow-hidden h-[48px] bg-white transition-all",
                      availableCount > 0
                        ? "border-blue-600/30 focus-within:ring-2 focus-within:ring-blue-600/20"
                        : "border-slate-200 bg-slate-50 opacity-60"
                    )}
                  >
                    <button
                      type="button"
                      disabled={availableCount === 0}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: Math.max(1, prev.quantity - 1),
                        }))
                      }
                      className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:cursor-not-allowed"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      className="flex-1 h-full border-none text-center font-bold text-slate-900 focus:ring-0 outline-none bg-transparent"
                      readOnly
                      value={formData.quantity}
                    />
                    <button
                      type="button"
                      disabled={availableCount === 0 || formData.quantity >= availableCount}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, quantity: prev.quantity + 1 }))
                      }
                      className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Submission Timestamp
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">{timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Installation Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                      placeholder="Enter installation location"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                    <input
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                      placeholder="+639..."
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* REASON FOR REQUEST */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Reason for Request
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
                placeholder="Describe why you need an additional device..."
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            {/* SUMMARY CARD */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl text-white shadow-lg shadow-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Info size={24} className="opacity-80" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Current Selection Summary
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {formData.quantity}x {formData.requestType}
                  </p>
                  <p className="text-[10px] font-medium opacity-70">
                    Location: {displayAddress.split(",")[0]} • Preferred: {timestamp.split(",")[0]}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 text-slate-500 font-bold text-xs rounded-full hover:bg-white hover:shadow-sm transition-all active:scale-95"
          >
            <RotateCcw size={16} />
            Clear Form
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-slate-400 font-bold text-xs hover:text-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              form="deviceRequestForm"
              type="submit"
              disabled={isSubmitting || availableCount === 0}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs rounded-full shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default memo(DeviceRequestModal);
