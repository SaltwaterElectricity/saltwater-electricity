import { X, Cpu, User, Hash, Calendar, BadgeCheck, CheckCircle2, MapPin, Power } from "lucide-react";
import { cn } from "../../utils/cn";
import ModalBackdrop from "./ModalBackdrop";

/**
 * DeviceDetailsModal Component
 * Mirroring the high-fidelity design from code1.html
 * Displays detailed information about a specific IoT device.
 */
const DeviceDetailsModal = ({ 
  isOpen, 
  onClose, 
  device, 
  assignmentDetails, 
  onUnassign, 
  isAdmin 
}) => {
  if (!isOpen || !device) return null;

  const { fullName, address, assignedAt, loading } = assignmentDetails || {};
  const isAvailable = device.availability === "available";

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not Available";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return "No Address Provided";
    if (typeof addr === "string") return addr;
    const parts = [addr.street, addr.baranggay, addr.cityProvince, addr.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Invalid Address Format";
  };

  return (
    <ModalBackdrop>
      <div className="bg-white w-full max-w-[580px] rounded-[24px] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 p-2">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUDfiBeldQ_VR_ACyg5kToBbfu8cYVsSY8LzrhRwvMaCDqX8cu6NnvpU1LSNvfI1QxxkRRrX5cy-R_Wxq1LhajmUi_iX1_UW8B6QtjkiQ9XvoP_IxdyZ7147XwjNRh0vif3OZEBDQeeUh-anwgX5kHbTUB1_w3qtHIxx4j37RXi4LlsB-_cDW6bfA2Duoj4rQu5neJIPQBfAmJspgUvS5si0goEjbBuLO6-18JvyQs_XWBKBL55MrzF6UvThPkOW5-En5044hkicBzyA" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Device <span className="text-blue-600">Information</span>
              </h3>
              <p className="text-sm text-slate-400 font-medium">Monitoring device deployment details.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          {/* Device Name */}
          <DetailItem 
            icon={Cpu} 
            label="Device Name" 
            value={device.device_name || "Unnamed Node"} 
          />

          {/* Assigned User */}
          <DetailItem 
            icon={User} 
            label="Assigned Household User" 
            value={loading ? "Fetching..." : fullName || "Not Assigned"} 
          />

          {/* Device ID */}
          <DetailItem 
            icon={Hash} 
            label="Device ID" 
            value={`ID: ${device.device_id}`} 
          />

          {/* Date Assigned */}
          <DetailItem 
            icon={Calendar} 
            label="Date Assigned" 
            value={loading ? "..." : formatDate(assignedAt)} 
          />

          {/* Owner */}
          <DetailItem 
            icon={BadgeCheck} 
            label="Owner" 
            value={loading ? "..." : fullName || "N/A"} 
          />

          {/* Status */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase border",
                  isAvailable 
                    ? "bg-green-50 text-green-600 border-green-100" 
                    : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                  {device.availability || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Location / Address */}
          <div className="md:col-span-2 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin size={20} />
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location / Address</span>
              <span className="text-sm font-semibold text-slate-700 leading-relaxed">
                {loading ? "Locating..." : formatAddress(address)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 font-bold text-sm text-slate-500 hover:bg-white hover:shadow-sm transition-all active:scale-95 rounded-xl border border-transparent hover:border-slate-100"
          >
            Cancel
          </button>
          
          {isAdmin && !isAvailable && (
            <button 
              onClick={() => {
                onUnassign(device.device_id);
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 rounded-xl"
            >
              <Power size={18} />
              Unassigned Device
            </button>
          )}
        </div>

        {/* Bottom decorative accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20" />
      </div>
    </ModalBackdrop>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
      <Icon size={20} />
    </div>
    <div className="flex flex-col gap-1 overflow-hidden">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold text-slate-900 truncate" title={value}>{value}</span>
    </div>
  </div>
);

export default DeviceDetailsModal;
