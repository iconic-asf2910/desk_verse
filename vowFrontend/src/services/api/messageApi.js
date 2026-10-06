import apiRequest from "../api";

const getMessages = async (workspaceId, roomId) => {
  const params = new URLSearchParams();

  params.set("workspaceId", workspaceId);

  if (roomId) {
    params.set("roomId", roomId);
  }

  return await apiRequest(`/api/messages?${params.toString()}`);
};

const getMessage = async (messageId) => {
  return await apiRequest(`/api/messages/${messageId}`);
};

const createMessage = async (
  workspaceId,
  roomId,
  content
) => {
  return await apiRequest("/api/messages", {
    method: "POST",
    body: JSON.stringify({
      workspaceId,
      roomId,
      content,
    }),
  });
};

const updateMessage = async (
  messageId,
  content
) => {
  return await apiRequest(`/api/messages/${messageId}`, {
    method: "PUT",
    body: JSON.stringify({
      content,
    }),
  });
};

const deleteMessage = async (messageId) => {
  return await apiRequest(
    `/api/messages/${messageId}`,
    {
      method: "DELETE",
    }
  );
};

export {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
};