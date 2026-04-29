import { createContext, useContext, useState, useCallback } from "react";

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};

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