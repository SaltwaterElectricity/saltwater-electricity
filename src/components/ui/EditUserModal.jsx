import { useState, memo } from "react";
import { X, Save, User, MapPin } from "lucide-react";
import { cn } from "../../utils/cn";
import SpinnerIcon from "./SpinnerIcon"; // Gamitin ang shared spinner mo

const EditUserModal = ({ isOpen, onClose, user, onSave, isLoading }) => {
  // 1. Local State para sa Form Inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    baranggay: "",
  });

  // 2. Sync Local State kapag nagbago ang piniling User (Derived State)
  // Note: Standard React practice is to use a `key={user?.uid}` on this component 
  // in the parent to automatically reset state. This useEffect is a fallback.
  const [lastUserId, setLastUserId] = useState(null);

  if (user && user.uid !== lastUserId) {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      baranggay: user.address?.baranggay || "",
    });
    setLastUserId(user.uid);
  }

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Ipass ang bagong data pabalik sa Dashboard
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 antialiased overflow-y-auto custom-scrollbar bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Modal Container with Animation (pareho sa ConfirmationModal mo) */}
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Update Profile parameter
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Editing: <span className="font-bold text-slate-700">{user.firstName} {user.lastName}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
              <input 
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
              <input 
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                placeholder="Dela Cruz"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Baranggay / Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                name="baranggay"
                value={formData.baranggay}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                placeholder="Poblacion Uno"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <footer className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-sm transition-all",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon size="w-3.5 h-3.5" color="text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
};

export default memo(EditUserModal);