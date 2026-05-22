import { useState, useCallback } from "react";
import { UIContext } from "./useUI";

export const UIProvider = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [settingsModal, setSettingsModal] = useState({
    isOpen: false,
    activeTab: "profile",
  });

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar_collapsed", JSON.stringify(newState));
      return newState;
    });
  }, []);

  const openSettings = useCallback((tab = "profile") => {
    setSettingsModal({ isOpen: true, activeTab: tab });
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    settingsModal,
    openSettings,
    closeSettings,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
