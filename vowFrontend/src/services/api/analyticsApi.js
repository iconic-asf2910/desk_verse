import apiRequest from "../api";

const getAnalytics = async (workspaceId) => {
  return await apiRequest(
    `/api/analytics?workspaceId=${encodeURIComponent(
      workspaceId
    )}`
  );
};

const createAnalytics = async (
  workspaceId,
  metric,
  value
) => {
  return await apiRequest(
    "/api/analytics",
    {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        metric,
        value,
      }),
    }
  );
};

export {
  getAnalytics,
  createAnalytics,
};