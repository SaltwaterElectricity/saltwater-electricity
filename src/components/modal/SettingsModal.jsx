import { useState, useEffect, memo } from "react";
import { ref, onValue } from "firebase/database"; // 👈 Idinagdag para basahin ang users node
import { db } from "../../firebaseConfig"; // Ayusin ang path base sa folder mo
import { useUI } from "../../context/UIContext";
import { X, User, Lock, History } from "lucide-react"; 
import { cn } from "../../utils/cn"; 

// 🔑 Imports para sa sub-views natin
import { SecurityForm } from "../profile/SecurityForm"; 
import { ProfileForm } from "../profile/ProfileForm";   
import { SessionHistory } from "../profile/SessionHistory";
import { ProfileFormSkeleton } from "../skeleton/ProfileFormSkeleton";

export const SettingsModal = memo(({ uid }) => {
  const { settingsModal, closeSettings } = useUI();
  const { isOpen, activeTab: initialTab } = settingsModal;
  
  const [activeTab, setActiveTab] = useState(initialTab); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync internal activeTab with context when modal opens
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }

  // 📦 State para sa Real-time User Data
  const [profileData, setProfileData] = useState(null);

  // 🛰️ 2. REAL-TIME FIREBASE LISTENER PARA SA PROFILE TAB
  useEffect(() => {
    if (!uid || !isOpen) return; // Wag kukuha ng data kung sarado ang modal para makatipid sa Spark Plan reads

    const userRef = ref(db, `/users/${uid}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfileData(snapshot.val()); // I-stream ang pinakabagong info
      }
    });

    return () => unsubscribe(); // Garbage collection
  }, [uid, isOpen]);

  const handleSaveSuccess = () => {
    setTimeout(() => {
      closeSettings();
      setIsSubmitting(false); 
    }, 2000); 
  };

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (!isSubmitting) {
      closeSettings();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* 🌑 Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={handleCloseModal} 
      />

      {/* 📦 Modal Container */}
      <div className="relative bg-white w-full max-w-2xl h-[550px] rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-100">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Account Settings</h2>
            <p className="text-[10px] font-bold text-slate-400">Manage your facility profile and system security credentials</p>
          </div>
          <button 
            onClick={handleCloseModal} 
            disabled={isSubmitting} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 📑 Tab Sidebar (Left side) */}
          <div className="w-16 md:w-52 border-r border-slate-100 p-2 md:p-3 space-y-2 bg-slate-50/50 flex-shrink-0 flex flex-col items-center md:items-stretch">
            <TabButton 
              isActive={activeTab === "profile"} 
              onClick={() => { if (!isSubmitting) setActiveTab("profile"); }} 
              disabled={isSubmitting}
              icon={User}
              label="Profile"
            />
            <TabButton 
              isActive={activeTab === "security"} 
              onClick={() => { if (!isSubmitting) setActiveTab("security"); }} 
              disabled={isSubmitting}
              icon={Lock}
              label="Security"
            />
            <TabButton 
              isActive={activeTab === "sessions"} 
              onClick={() => { if (!isSubmitting) setActiveTab("sessions"); }} 
              disabled={isSubmitting}
              icon={History}
              label="Sessions"
            />
          </div>

          {/* 🖥️ Dynamic Forms Display (Right side) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white min-w-0">
            {activeTab === "profile" && (
              !profileData ? (
                <ProfileFormSkeleton />
              ) : (
                <ProfileForm 
                  profileData={profileData} 
                  currentUid={uid} 
                  onSaveSuccess={handleSaveSuccess}
                  setIsSubmitting={setIsSubmitting}
                />
              )
            )}
            {activeTab === "security" && (
              <SecurityForm 
                onSaveSuccess={handleSaveSuccess}
                setIsSubmitting={setIsSubmitting}
              />
            )}
            {activeTab === "sessions" && (
              <SessionHistory uid={uid} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const TabButton = ({ isActive, onClick, disabled, icon: Icon, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "w-full flex items-center justify-center md:justify-start gap-0 md:gap-3 p-3 rounded-xl text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
    <span className="hidden md:inline truncate">{label}</span>
  </button>
);