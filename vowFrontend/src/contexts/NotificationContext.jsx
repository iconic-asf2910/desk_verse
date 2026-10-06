import { createContext, useEffect, useState } from "react";

const NotificationContext = createContext();

const initialNotifications = [
  {
    id: crypto.randomUUID(),
    title: "Welcome to DeskVerse",
    message: "Your workspace is ready to use.",
    type: "system",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "New task assigned",
    message: "You have been assigned a new task.",
    type: "task",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Meeting reminder",
    message: "You have an upcoming meeting.",
    type: "meeting",
    read: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("DeskVerse_notifications");

    return saved ? JSON.parse(saved) : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem(
      "DeskVerse_notifications",
      JSON.stringify(notifications),
    );
  }, [notifications]);

  const addNotification = ({ title, message, type = "system" }) => {
    const notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((previous) => [notification, ...previous]);
  };

  const markAsRead = (notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== notificationId),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };
