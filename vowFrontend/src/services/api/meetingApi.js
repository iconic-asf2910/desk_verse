const getMeeting = async (meetingId, token) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/meetings/${meetingId}`,
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
    `${import.meta.env.VITE_API_URL}/meetings`,
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

export { getMeeting, createMeeting };