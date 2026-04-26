// Shared notification state so pages can show quick feedback.
import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const buildNotification = (type, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  message,
});

// Keep notification provider focused and easier to understand from the code nearby.
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Keep remove notification focused and easier to understand from the code nearby.
  const removeNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  // Keep push notification focused and easier to understand from the code nearby.
  const pushNotification = (type, message) => {
    const notification = buildNotification(type, message);
    setNotifications((current) => [...current, notification]);
    setTimeout(() => removeNotification(notification.id), 3500);
  };

  const value = useMemo(
    () => ({
      notifications,
      success: (message) => pushNotification("success", message),
      error: (message) => pushNotification("error", message),
      info: (message) => pushNotification("info", message),
      removeNotification,
    }),
    [notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Keep use notifications focused and easier to understand from the code nearby.
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
};
