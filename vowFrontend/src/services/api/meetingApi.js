const getMeetings = async (token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch meetings");
  }

  return data;
};

const getMeeting = async (meetingId, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch meeting");
  }

  return data;
};

const createMeeting = async (meetingData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create meeting");
  }

  return data;
};

const updateMeeting = async (meetingId, meetingData, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meetingData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update meeting");
  }

  return data;
};

const deleteMeeting = async (meetingId, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/meetings/${meetingId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete meeting");
  }

  return data;
};

export {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};