import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';
import { assignDevice } from '../../services/device.service';
import { ROLES } from '../../constants/roles';
import GlobalSearch from '../ui/GlobalSearch'; 
import { useSearch } from '../../hooks/useSearch';

import ModalBackdrop from './ModalBackdrop';

const AssignDeviceModal = ({ device, isOpen, onClose, onShowToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableDeviceName, setEditableDeviceName] = useState("");

  const { 
    searchTerm, 
    setSearchTerm, 
    filteredData: filteredUsers, 
    isSearching 
  } = useSearch(users, ['firstName', 'lastName', 'email']);

  // SAFETY: Centralized close logic
  const handleClose = useCallback(() => {
    setSearchTerm("");
    setSelectedUser(null);
    onClose();
  }, [onClose, setSearchTerm]);

  // ACCESSIBILITY: Keyboard support
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  useEffect(() => {
    let isMounted = true; // Safety against memory leaks

    if (isOpen && device) {
      setEditableDeviceName(device.device_name || "");
      
      const loadData = async () => {
        setLoading(true);
        try {
          const [uSnap, rSnap] = await Promise.all([
            get(ref(db, 'users')),
            get(ref(db, 'roles'))
          ]);

          if (isMounted && uSnap.exists()) {
            const roles = rSnap.val() || {};
            const validUsers = [];
            
            uSnap.forEach((child) => {
              const role = roles[child.key]?.role;
              if (role === ROLES.ADMIN || role === ROLES.RESIDENT) {
                validUsers.push({ uid: child.key, ...child.val(), role });
              }
            });
            setUsers(validUsers);
          }
        } catch {
          if (isMounted) onShowToast("System access restricted or offline.", "error");
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      loadData();
    }
    return () => { isMounted = false; };
  }, [isOpen, device, onShowToast]);


  const onAssignTrigger = async () => {
    if (!selectedUser || !editableDeviceName.trim()) return;
    setIsSubmitting(true);
    
    try {
      await assignDevice(device.device_id, selectedUser.uid, editableDeviceName.trim());
      onShowToast("Assignment confirmed.", "success");
      handleClose();
    } catch (error) {
      onShowToast(error.message || "Update failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <div className="bg-white rounded-[32px] shadow-2xl w-[92%] sm:w-full max-w-[440px] overflow-hidden animate-slideUp border border-gray-100">
        
        {/* Header - Using 8pt (p-6 = 24px) */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 text-center">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none italic font-['Space_Grotesk']">Assign <span className="text-blue-600">Device</span></h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-['Inter']">Link this hardware to a verified user.</p>
        </div>

        <div className="p-8 flex flex-col gap-6">
          {/* User Search Section */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 font-['Inter']">
              Select Representative
            </label>
            
            <GlobalSearch 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isSearching={isSearching || loading}
              placeholder="Name or email address..."
            />
            
            {searchTerm.length > 0 && (
              <div className="absolute left-0 right-0 z-50 w-full max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl divide-y divide-gray-50 shadow-2xl bg-white mt-1 ring-1 ring-black/5 animate-fadeIn">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <button
                      key={user.uid}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchTerm(""); // <--- Napakahalaga nito para sumara ang dropdown matapos pumili
                      }}
                      className={`w-full p-4 flex items-center gap-4 transition-all ${
                        selectedUser?.uid === user.uid ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        selectedUser?.uid === user.uid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate font-['Inter']">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter font-['Inter']">{user.role}</p>
                      </div>
                    </button>
                  ))
                ) : !isSearching && (
                  <div className="p-8 text-center text-xs text-gray-400 italic font-medium font-['Inter']">No matching users.</div>
                )}
              </div>
            )}
          </div>

          {/* Device Naming Section */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 font-['Inter']">
              Display Name (UI)
            </label>
            <div className="relative group">
              <input 
                type="text"
                maxLength={32}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-sm font-bold text-gray-800 placeholder:text-gray-300 font-['Inter']"
                value={editableDeviceName}
                onChange={(e) => setEditableDeviceName(e.target.value)}
                placeholder="e.g., Main Tank Sensor"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-gray-300 bg-white px-1">
                {device?.device_id?.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {/* Selected State Indicator */}
        <div className="px-8 h-14">
          {selectedUser ? (
            <div className="h-full px-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-fadeIn">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">✓</div>
              <p className="text-xs font-bold text-green-700 truncate font-['Inter']">Ready for {selectedUser.firstName}</p>
            </div>
          ) : (
            <div className="h-full border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest font-['Inter']">Awaiting Selection</p>
            </div>
          )}
        </div>

        {/* Footer - 8pt grid (p-6) */}
        <div className="p-8 flex gap-3 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleClose} 
            className="flex-1 h-12 rounded-xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-[10px] tracking-widest uppercase font-['Inter']"
          >
            CANCEL
          </button>
          <button 
            disabled={!selectedUser || isSubmitting || !editableDeviceName.trim()}
            onClick={onAssignTrigger}
            className={`flex-1 h-12 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase font-['Inter'] ${
              selectedUser && !isSubmitting && editableDeviceName.trim()
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'PROCESSING...' : 'CONFIRM LINK'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default AssignDeviceModal;