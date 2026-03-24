import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const buildNotification = (type, message) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  message,
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

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

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
};
