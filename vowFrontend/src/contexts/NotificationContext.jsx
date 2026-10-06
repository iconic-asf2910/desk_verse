import {
  createContext,
  useEffect,
  useState,
} from "react";

const NotificationContext =
  createContext();

const NotificationProvider = ({
  children,
}) => {
  const [notifications, setNotifications] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "deskverse_notifications"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  useEffect(() => {
    localStorage.setItem(
      "deskverse_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const addNotification = ({
    title,
    message,
    type = "info",
  }) => {
    const notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      read: false,
      createdAt:
        new Date().toISOString(),
    };

    setNotifications((previous) => [
      notification,
      ...previous,
    ]);
  };

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount =
    notifications.filter(
      (item) => !item.read
    ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export {
  NotificationContext,
  NotificationProvider,
};