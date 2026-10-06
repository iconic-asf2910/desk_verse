import apiRequest from "../api";

const getPresence = async (userId, workspaceId) => {
  const query = workspaceId
    ? `?workspaceId=${encodeURIComponent(workspaceId)}`
    : "";

  return await apiRequest(
    `/api/presence/${userId}${query}`
  );
};

const updatePresence = async (userId, status) => {
  return await apiRequest(
    `/api/presence/${userId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }
  );
};

export {
  getPresence,
  updatePresence,
};