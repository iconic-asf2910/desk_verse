import apiRequest from "../api";

const getWorkspaces = async () => {
  return await apiRequest("/api/workspaces");
};

const getWorkspace = async (id) => {
  return await apiRequest(`/api/workspaces/${id}`);
};

const createWorkspace = async (workspaceData) => {
  return await apiRequest("/api/workspaces", {
    method: "POST",
    body: JSON.stringify(workspaceData),
  });
};

const updateWorkspace = async (id, workspaceData) => {
  return await apiRequest(`/api/workspaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(workspaceData),
  });
};

const deleteWorkspace = async (id) => {
  return await apiRequest(`/api/workspaces/${id}`, {
    method: "DELETE",
  });
};

const addWorkspaceMember = async (workspaceId, email) => {
  return await apiRequest(
    `/api/workspaces/${workspaceId}/members`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
};

export {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
};
