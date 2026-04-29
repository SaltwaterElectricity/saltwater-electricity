import { useState, useCallback } from "react";
import Toast from "../components/ui/Toast";
import { NotificationContext } from "./useNotification";

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
