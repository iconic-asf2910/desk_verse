import apiRequest from "../api";

const getRooms = async (workspaceId) => {
  return await apiRequest(`/api/workspaces/${workspaceId}/rooms`);
};

const getRoom = async (roomId) => {
  return await apiRequest(`/api/rooms/${roomId}`);
};

const createRoom = async (workspaceId, roomData) => {
  return await apiRequest(`/api/workspaces/${workspaceId}/rooms`, {
    method: "POST",
    body: JSON.stringify(roomData),
  });
};

const updateRoom = async (roomId, roomData) => {
  return await apiRequest(`/api/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(roomData),
  });
};

const deleteRoom = async (roomId) => {
  return await apiRequest(`/api/rooms/${roomId}`, {
    method: "DELETE",
  });
};

export {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};