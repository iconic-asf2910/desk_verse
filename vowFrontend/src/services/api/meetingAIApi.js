const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const saveMeetingAIResult = async (meetingId, result, token) => {
  if (!meetingId) {
    throw new Error("Meeting ID is required.");
  }

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/ai-result`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(result),
    },
  );

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Failed to save AI result.";

    throw new Error(message);
  }

  return data;
};

export const getMeetingAIResult = async (meetingId, token) => {
  if (!meetingId) {
    throw new Error("Meeting ID is required.");
  }

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const response = await fetch(
    `${API_URL}/api/meetings/${meetingId}/ai-result`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Failed to load AI result.";

    throw new Error(message);
  }

  return data;
};
