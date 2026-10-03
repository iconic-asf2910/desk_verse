const getWorkspaces = async (token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workspaces");
  }

  return data;
};

const getWorkspace = async (id, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workspace");
  }

  return data;
};

const createWorkspace = async (workspaceData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workspaceData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create workspace");
  }

  return data;
};

const updateWorkspace = async (id, workspaceData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(workspaceData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update workspace");
  }

  return data;
};

const deleteWorkspace = async (id, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete workspace");
  }

  return data;
};

export {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
};