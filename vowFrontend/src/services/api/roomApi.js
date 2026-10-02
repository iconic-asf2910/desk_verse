const getRooms = async (workspaceId, token) => {
  const response = await fetch(
    `BACKEND_ROOMS_URL/${workspaceId}`,
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

export { getRooms };