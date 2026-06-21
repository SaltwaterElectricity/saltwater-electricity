import { useState, useCallback } from "react";
import { UIContext } from "./useUI";

export const UIProvider = ({ children }) => {
  const [settingsModal, setSettingsModal] = useState({
    isOpen: false,
    activeTab: "profile"
  });

  const openSettings = useCallback((tab = "profile") => {
    setSettingsModal({ isOpen: true, activeTab: tab });
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    settingsModal,
    openSettings,
    closeSettings
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
