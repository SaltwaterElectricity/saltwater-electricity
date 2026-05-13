import { useState, memo } from "react";
import { X, Cpu, ChevronRight } from "lucide-react";
import { createDeviceRequest } from "../../services/request.service";
import ModalBackdrop from "./ModalBackdrop";
import { cn } from "../../utils/cn";

/**
 * DeviceRequestModal Component
 * Standardized modal for residents to request new hardware monitoring units.
 * Adheres to AlonKuryente visual language and 8-point grid.
 */
const DeviceRequestModal = ({ isOpen, onClose, onShowToast }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    requestType: "new_installation",
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({ deviceName: "", requestType: "new_installation" });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deviceName.trim()) return;

    setIsSubmitting(true);
    try {
      await createDeviceRequest({
        deviceName: formData.deviceName.trim(),
        requestType: formData.requestType,
      });
      onShowToast("Request submitted successfully.", "success");
      handleClose();
    } catch (error) {
      onShowToast(error.message || "Failed to submit request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      <div className="bg-white rounded-[32px] shadow-2xl w-[92%] sm:w-full max-w-[440px] overflow-hidden animate-zoomIn border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic font-display">
              Request <span className="text-primary">Unit</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 font-body-md">
              Specify your hardware needs
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Device Icon Decor */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
              <Cpu size={32} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 font-body-md">
              Target Device Name
            </label>
            <input
              type="text"
              required
              maxLength={32}
              placeholder="e.g., Guest House Node"
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-body-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 font-body-md">
              Request Classification
            </label>
            <div className="relative">
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all appearance-none font-body-md"
              >
                <option value="new_installation">New Installation</option>
                <option value="replacement">Device Replacement</option>
                <option value="upgrade">Hardware Upgrade</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-50 mt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-[10px] tracking-widest uppercase font-body-md"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.deviceName.trim()}
              className={cn(
                "flex-[1.5] h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase flex items-center justify-center gap-2 font-body-md",
                formData.deviceName.trim() && !isSubmitting
                  ? "ocean-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Submit Request
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export default memo(DeviceRequestModal);
