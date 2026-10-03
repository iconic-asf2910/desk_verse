const getRooms = async (workspaceId) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/rooms`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch rooms");
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

export { getRooms, createRoom };