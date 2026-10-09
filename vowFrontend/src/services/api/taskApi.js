import apiRequest from "../api";

const getTasks = async (
  workspaceId,
  assignedTo = ""
) => {
  const params =
    new URLSearchParams();

  params.set(
    "workspaceId",
    workspaceId
  );

  if (assignedTo) {
    params.set(
      "assignedTo",
      assignedTo
    );
  }

  return await apiRequest(
    `/api/tasks?${params.toString()}`
  );
};

const getTask = async (
  taskId
) => {
  return await apiRequest(
    `/api/tasks/${taskId}`
  );
};

const createTask = async (
  taskData
) => {
  return await apiRequest(
    "/api/tasks",
    {
      method: "POST",
      body: JSON.stringify(
        taskData
      ),
    }
  );
};

const updateTask = async (
  taskId,
  taskData
) => {
  return await apiRequest(
    `/api/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(
        taskData
      ),
    }
  );
};

const deleteTask = async (
  taskId
) => {
  return await apiRequest(
    `/api/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );
};

export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};