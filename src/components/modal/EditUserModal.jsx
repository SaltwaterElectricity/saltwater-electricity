import { useState, memo, useEffect } from "react";
import { X, Save, MapPin, Mail } from "lucide-react";
import { cn } from "../../utils/cn";
import SpinnerIcon from "../ui/SpinnerIcon";
import ModalBackdrop from "./ModalBackdrop";

const EditUserModal = ({ isOpen, onClose, user, onSave, isLoading, showRoleField = true }) => {
  // Local State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    status: "",
    baranggay: "",
  });

  const userUid = user?.uid;

  // Sync state when user prop changes
  useEffect(() => {
    if (userUid && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "",
        status: user.status || "active",
        baranggay: user.address?.baranggay || "",
      });
    }
  }, [
    userUid,
    isOpen,
    user?.firstName,
    user?.lastName,
    user?.email,
    user?.role,
    user?.status,
    user?.address?.baranggay,
  ]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ModalBackdrop>
      <div className="relative w-[92%] sm:w-full max-w-[500px] bg-white border border-outline-variant/30 rounded-[32px] shadow-2xl p-8 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h4 className="font-headline-md text-headline-md text-on-surface">Edit User Details</h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-high rounded-full text-outline transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-label-sm text-outline mb-1.5 ml-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-label-sm text-outline mb-1.5 ml-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-label-sm text-outline mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl outline-none font-body-md text-on-surface-variant cursor-not-allowed"
                />
              </div>
            </div>

            {showRoleField && (
              <div className="col-span-1">
                <label className="block text-label-sm text-outline mb-1.5 ml-1">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="resident">Resident</option>
                  </select>
                </div>
              </div>
            )}

            <div className="col-span-1">
              <label className="block text-label-sm text-outline mb-1.5 ml-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-label-sm text-outline mb-1.5 ml-1">
                Assigned Location
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                />
                <input
                  type="text"
                  name="baranggay"
                  value={formData.baranggay}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant/30 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md"
                  placeholder="e.g. San Andres"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "primary-gradient-btn px-8 py-3 text-white rounded-xl font-label-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon size="w-4 h-4" color="text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export default memo(EditUserModal);
