import {
  createContext,
  useEffect,
  useState,
} from "react";
import useWorkspace from "../hooks/UseWorkspace";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api/taskApi";

const TaskContext = createContext();

const toUiStatus = (status) => {
  if (status === "completed") {
    return "Done";
  }

  if (status === "in_progress") {
    return "In Progress";
  }

  return "To Do";
};

const toApiStatus = (status) => {
  if (status === "Done") {
    return "completed";
  }

  if (status === "In Progress") {
    return "in_progress";
  }

  return "todo";
};

const normalizeTask = (task) => ({
  ...task,
  status: toUiStatus(task.status),
});

const TaskProvider = ({ children }) => {
  const { workspace } = useWorkspace();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] =
    useState(false);
  const [taskError, setTaskError] =
    useState("");

  const loadTasks = async () => {
    if (!workspace?.id) {
      setTasks([]);
      return;
    }

    try {
      setLoadingTasks(true);
      setTaskError("");

      const data = await getTasks(
        workspace.id
      );

      setTasks(
        Array.isArray(data)
          ? data.map(normalizeTask)
          : []
      );
    } catch (error) {
      setTaskError(error.message);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [workspace?.id]);

  const addTask = async (taskData) => {
    if (!workspace?.id) {
      throw new Error(
        "No workspace selected."
      );
    }

    const task = await createTask({
      workspaceId: workspace.id,
      title: taskData.title.trim(),
      description:
        taskData.description || "",
      assignedTo:
        taskData.assignedTo || "",
      status: toApiStatus(
        taskData.status || "To Do"
      ),
      priority:
        taskData.priority || "medium",
    });

    const normalizedTask =
      normalizeTask(task);

    setTasks((previous) => [
      ...previous,
      normalizedTask,
    ]);

    return normalizedTask;
  };

  const updateTaskStatus = async (
    taskId,
    status
  ) => {
    const updated = await updateTask(
      taskId,
      {
        status: toApiStatus(status),
      }
    );

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...normalizeTask(updated),
            }
          : task
      )
    );
  };

  const updateTaskData = async (
    taskId,
    data
  ) => {
    const payload = {
      ...data,
    };

    if (payload.status) {
      payload.status = toApiStatus(
        payload.status
      );
    }

    const updated = await updateTask(
      taskId,
      payload
    );

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...normalizeTask(updated),
            }
          : task
      )
    );
  };

  const removeTask = async (taskId) => {
    await deleteTask(taskId);

    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== taskId
      )
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTaskStatus,
        updateTask: updateTaskData,
        deleteTask: removeTask,
        loadTasks,
        loadingTasks,
        taskError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export {
  TaskContext,
  TaskProvider,
};