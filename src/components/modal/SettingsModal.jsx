import { useState, useEffect, memo, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebaseConfig";
import { useUI } from "../../context/useUI";
import { X, User, Shield, History, Zap, Camera } from "lucide-react";
import { cn } from "../../utils/cn";

// 🔑 Imports para sa sub-views natin
import { SecurityForm } from "../profile/SecurityForm";
import { ProfileForm } from "../profile/ProfileForm";
import { SessionHistory } from "../profile/SessionHistory";
import { ProfileFormSkeleton } from "../skeleton/ProfileFormSkeleton";
import saltwaterLogo from "../../assets/landing-page-img/saltwater-electricity-logo.png";

export const SettingsModal = memo(({ uid }) => {
  const { settingsModal, closeSettings } = useUI();
  const { isOpen, activeTab: initialTab } = settingsModal;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const heroRef = useRef(null);

  // Parallax effect for hero banner
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { innerWidth, innerHeight } = window;
      const moveX = (e.clientX - innerWidth / 2) * 0.01;
      const moveY = (e.clientY - innerHeight / 2) * 0.01;
      heroRef.current.style.backgroundPosition = `${moveX}px ${moveY}px`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen]);

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
    if (!uid || !isOpen) return;

    const userRef = ref(db, `/users/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfileData(snapshot.val());
      }
    });

    return () => unsubscribe();
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

      {/* 📦 Modal Container - Mirrored from code1.html - Resized */}
      <div className="relative w-full max-w-[900px] h-[600px] bg-[#f8f9ff] rounded-[24px] shadow-2xl overflow-hidden flex border border-blue-500/10 z-10 animate-in zoom-in duration-300">
        {/* aside Sidebar Navigation */}
        <aside className="w-[240px] bg-white border-r border-slate-100 flex flex-col p-5 space-y-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-white shadow-lg shadow-primary/20 overflow-hidden border border-slate-50">
              <img src={saltwaterLogo} alt="Logo" className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <h1 className="font-display text-base font-extrabold text-[#004ac6] leading-tight tracking-tight uppercase">
                SALTWATER
              </h1>
              <p className="text-[10px] font-medium text-slate-400 font-display">
                Electricity Monitor
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            <SidebarTab
              isActive={activeTab === "profile"}
              onClick={() => !isSubmitting && setActiveTab("profile")}
              icon={User}
              label="Profile Information"
            />
            <SidebarTab
              isActive={activeTab === "security"}
              onClick={() => !isSubmitting && setActiveTab("security")}
              icon={Shield}
              label="Security Settings"
            />
            <SidebarTab
              isActive={activeTab === "sessions"}
              onClick={() => !isSubmitting && setActiveTab("sessions")}
              icon={History}
              label="Session History"
            />
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col bg-slate-50/50 overflow-y-auto relative scroll-smooth scrollbar-none">
          {/* Close Button Overlay */}
          <button
            onClick={handleCloseModal}
            className="absolute top-5 right-5 z-40 bg-white/40 backdrop-blur hover:bg-white w-9 h-9 rounded-full flex items-center justify-center border border-white/40 shadow-sm transition-all active:scale-90"
          >
            <X size={18} className="text-[#004ac6]" />
          </button>

          {/* Hero Banner */}
          <section
            ref={heroRef}
            className="h-[140px] bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#dce9ff] relative w-full overflow-hidden flex-shrink-0 transition-all duration-75"
          >
            {/* Abstract Waves */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320">
                <path
                  d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,245.3C960,224,1056,160,1152,149.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  fill="#ffffff"
                />
              </svg>
            </div>
            <div className="absolute -right-16 -top-16 opacity-10">
              <Zap size={220} className="text-white" />
            </div>
            <div className="absolute inset-x-0 top-4 flex justify-center z-20">
              <button className="bg-white/20 backdrop-blur hover:bg-white/40 px-3 py-1.5 rounded-lg border border-white/30 flex items-center gap-1.5 text-white transition-all active:scale-95 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <Camera size={14} />
                Edit Cover
              </button>
            </div>
          </section>

          {/* Dynamic Content Display */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" &&
              (!profileData ? (
                <ProfileFormSkeleton />
              ) : (
                <ProfileForm
                  profileData={profileData}
                  currentUid={uid}
                  onSaveSuccess={handleSaveSuccess}
                  setIsSubmitting={setIsSubmitting}
                />
              ))}
            {activeTab === "security" && (
              <SecurityForm onSaveSuccess={handleSaveSuccess} setIsSubmitting={setIsSubmitting} />
            )}
            {activeTab === "sessions" && <SessionHistory uid={uid} />}
          </div>
        </main>
      </div>
    </div>
  );
});

SettingsModal.displayName = "SettingsModal";

const SidebarTab = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 group font-display text-[14px]",
      isActive
        ? "bg-[#eff4ff] text-[#004ac6] border-l-4 border-[#004ac6] font-bold"
        : "text-slate-500 hover:bg-slate-50 border-l-4 border-transparent"
    )}
  >
    <Icon
      size={20}
      className={cn(
        "transition-colors",
        isActive ? "text-[#004ac6]" : "text-slate-400 group-hover:text-slate-600"
      )}
    />
    <span>{label}</span>
  </button>
);
