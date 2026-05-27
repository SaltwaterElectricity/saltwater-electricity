import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTimeout } from "../hooks/useTimeout";
import Sidebar from "./Sidebar";
import { NavbarHeader } from "./NavbarHeader";
import { BottomNav } from "./BottomNavLink";
import { useAuth } from "../context/useAuth";
import { useUI } from "../context/useUI";
import { SettingsModal } from "../components/modal/SettingsModal";
import { ROLES } from "../constants/roles";
import { cn } from "../utils/cn";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { currentUser, isAdmin, userRole } = useAuth() || {};
  const { isSidebarCollapsed } = useUI();
  const currentUid = currentUser?.uid || "";
  const isResident = userRole === ROLES.RESIDENT;
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  useTimeout(isAdmin ? 1800000 : null);

  return (
    <div className="bg-background text-on-surface font-body-md h-screen overflow-hidden antialiased flex flex-col">
      <Sidebar _isOpen={isSidebarOpen} _toggleSidebar={toggleSidebar} />

      {/* Main Content Canvas */}
      <main
        className={cn(
          "flex-1 flex flex-col h-full min-w-0 relative transition-all duration-300",
          isResident ? "md:ml-64" : isSidebarCollapsed ? "md:ml-16" : isSuperAdmin ? "md:ml-64" : "md:ml-64"
        )}
      >
        {/* Top App Bar */}
        <NavbarHeader currentUid={currentUid} />

        {/* Dynamic Page Content: Primary Scrollable Region */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-gutter md:p-margin pb-24 md:pb-8">{children || <Outlet />}</div>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <BottomNav toggleSidebar={toggleSidebar} />

      {/* Global Visual Background Ornament */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[100px]" />
      </div>

      <SettingsModal uid={currentUid} />
    </div>
  );
};

export default MainLayout;
