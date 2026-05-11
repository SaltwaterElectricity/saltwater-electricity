import { useState, useEffect, memo } from "react";
import { ref, onValue } from "firebase/database"; // 👈 Idinagdag para basahin ang users node
import { db } from "../../firebaseConfig"; // Ayusin ang path base sa folder mo
import { useUI } from "../../context/useUI";
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
      <div className="relative glass-panel w-full max-w-2xl h-[550px] rounded-[32px] shadow-[0_40px_80px_rgba(0,82,204,0.12)] flex flex-col overflow-hidden z-10 animate-zoomIn border border-white/40">
        
        {/* Header */}
        <div className="h-18 flex items-center justify-between px-8 border-b border-outline-variant/20 flex-shrink-0 bg-surface-container-low/50 backdrop-blur-md">
          <div>
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] font-display">System Configuration</h2>
            <p className="text-h2 font-bold text-on-surface tracking-tight mt-0.5">Account Settings</p>
          </div>
          <button 
            onClick={handleCloseModal} 
            disabled={isSubmitting} 
            className="p-2.5 rounded-xl text-outline hover:text-on-surface hover:bg-white/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-outline-variant/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 📑 Tab Sidebar (Left side) */}
          <div className="w-16 md:w-56 border-r border-outline-variant/20 p-3 space-y-2 bg-surface-container-low/30 flex-shrink-0 flex flex-col items-center md:items-stretch">
            <TabButton 
              isActive={activeTab === "profile"} 
              onClick={() => { if (!isSubmitting) setActiveTab("profile"); }} 
              disabled={isSubmitting}
              icon={User}
              label="Facility Profile"
            />
            <TabButton 
              isActive={activeTab === "security"} 
              onClick={() => { if (!isSubmitting) setActiveTab("security"); }} 
              disabled={isSubmitting}
              icon={Lock}
              label="Security Protocol"
            />
            <TabButton 
              isActive={activeTab === "sessions"} 
              onClick={() => { if (!isSubmitting) setActiveTab("sessions"); }} 
              disabled={isSubmitting}
              icon={History}
              label="Session Audit"
            />
          </div>

          {/* 🖥️ Dynamic Forms Display (Right side) */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-white/40 min-w-0">
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

SettingsModal.displayName = 'SettingsModal';

const TabButton = ({ isActive, onClick, disabled, icon: Icon, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "w-full flex items-center justify-center md:justify-start gap-0 md:gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-60 font-body-md",
      isActive 
        ? "ocean-gradient text-white shadow-lg shadow-primary/20" 
        : "text-outline hover:bg-white/40 hover:text-on-surface"
    )}
  >
    <Icon size={18} className={isActive ? "text-white" : "text-outline"} />
    <span className="hidden md:inline truncate">{label}</span>
  </button>
);