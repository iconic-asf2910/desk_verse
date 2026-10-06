import {
  createContext,
  useEffect,
  useState,
} from "react";

const ActivityContext =
  createContext();

const ActivityProvider = ({
  children,
}) => {
  const [activities, setActivities] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "deskverse_activities"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  useEffect(() => {
    localStorage.setItem(
      "deskverse_activities",
      JSON.stringify(activities)
    );
  }, [activities]);

  const addActivity = ({
    action,
    description,
    type = "general",
  }) => {
    const activity = {
      id: crypto.randomUUID(),
      action,
      description,
      type,
      createdAt:
        new Date().toISOString(),
    };

    setActivities((previous) => [
      activity,
      ...previous,
    ]);
  };

  const deleteActivity = (id) => {
    setActivities((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
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

export {
  ActivityContext,
  ActivityProvider,
};