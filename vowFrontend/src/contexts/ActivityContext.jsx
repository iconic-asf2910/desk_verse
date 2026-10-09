import { createContext, useEffect, useState } from "react";

const ActivityContext = createContext();

const STORAGE_KEY = "deskverse_activities";

const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const addActivity = ({
    action,
    description,
    type = "general",
    user = null,
  }) => {
    const activity = {
      id: crypto.randomUUID(),

      action: action || "Workspace activity",

      description: description || "",

      type,

      user,

      createdAt: new Date().toISOString(),
    };

    setActivities((previous) => [activity, ...previous]);

    return activity;
  };

  const deleteActivity = (id) => {
    setActivities((previous) => previous.filter((item) => item.id !== id));
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        deleteActivity,
        clearActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export { ActivityContext, ActivityProvider };
