import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({ message: "", type: "success", isOpen: false });

  const showNotification = useCallback((message, type = "success") => {
    setToastConfig({ message, type, isOpen: true });
  }, []);

  const hideNotification = useCallback(() => {
    setToastConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Toast 
        isOpen={toastConfig.isOpen} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={hideNotification} 
      />
    </NotificationContext.Provider>
  );
};