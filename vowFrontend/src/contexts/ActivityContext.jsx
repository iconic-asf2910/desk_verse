import { createContext, useEffect, useState } from "react";

const ActivityContext = createContext();

const initialActivities = [
  {
    id: crypto.randomUUID(),
    type: "workspace",
    message: "Workspace activity started",
    user: "System",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    type: "task",
    message: "A task was created",
    user: "System",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    type: "meeting",
    message: "A meeting was scheduled",
    user: "System",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("DeskVerse_activities");

    return saved ? JSON.parse(saved) : initialActivities;
  });

  useEffect(() => {
    localStorage.setItem("DeskVerse_activities", JSON.stringify(activities));
  }, [activities]);

  const addActivity = ({ type, message, user = "User" }) => {
    const activity = {
      id: crypto.randomUUID(),
      type,
      message,
      user,
      createdAt: new Date().toISOString(),
    };

    setActivities((previous) => [activity, ...previous]);
  };

  const deleteActivity = (activityId) => {
    setActivities((previous) =>
      previous.filter((activity) => activity.id !== activityId),
    );
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
