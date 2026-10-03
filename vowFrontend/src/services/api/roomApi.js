const getRooms = async (workspaceId, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/rooms`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch rooms");
  }

  return data;
};

const getRoom = async (id, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/rooms/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch room");
  }

  return data;
};

const createRoom = async (workspaceId, roomData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/rooms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create room");
  }

  return data;
};

const updateRoom = async (id, roomData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/rooms/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(roomData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update room");
  }

  return data;
};

const deleteRoom = async (id, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/rooms/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete room");
  }

  return data;
};

export {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};