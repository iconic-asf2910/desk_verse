import { createContext, useEffect, useState } from "react";

const TaskContext = createContext();

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("vow_tasks");

      if (!savedTasks) {
        return [];
      }

      const parsedTasks = JSON.parse(savedTasks);

      return Array.isArray(parsedTasks)
        ? parsedTasks
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "vow_tasks",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  const addTask = (taskData) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: taskData.title.trim(),
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      status: "To Do",
      createdAt: new Date().toISOString(),
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      newTask,
    ]);

    return newTask;
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    );
  };

  const updateTask = (taskId, updates) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
            }
          : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter(
        (task) => task.id !== taskId
      )
    );
  };

  const clearTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        clearTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskProvider };