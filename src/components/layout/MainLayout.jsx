import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useTimeout } from "../../hooks/useTimeout";
import Sidebar from "./Sidebar";
import { NavbarHeader } from "./NavbarHeader"; 
import { BottomNav } from "./BottomNav";
import { useAuth } from "../../context/useAuth"; 
import { SettingsModal } from "../modal/SettingsModal";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { currentUser, isAdmin } = useAuth() || {}; 
  const currentUid = currentUser?.uid || "";

  useTimeout(isAdmin ? 1800000 : null);

  return (
    <div className="bg-background text-on-surface font-body-md h-screen overflow-hidden antialiased flex flex-col">
      <Sidebar _isOpen={isSidebarOpen} _toggleSidebar={toggleSidebar} />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-full md:ml-20 min-w-0 relative">

        {/* Top App Bar */}
        <NavbarHeader currentUid={currentUid} />

        {/* Dynamic Page Content: Primary Scrollable Region */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-gutter md:p-margin max-w-7xl mx-auto pb-24 md:pb-8">
            {children || <Outlet />}
          </div>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <BottomNav toggleSidebar={toggleSidebar} />

      {/* Global Visual Background Ornament */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-100 rounded-full blur-[100px]"></div>
      </div>

      <SettingsModal uid={currentUid}/>
    </div>
  );
};

export default MainLayout;