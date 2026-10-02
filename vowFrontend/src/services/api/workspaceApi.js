const getWorkspaces = async (token) => {
  const response = await fetch("BACKEND_WORKSPACES_URL", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workspaces");
  }

  return data;
};

export { getWorkspaces };