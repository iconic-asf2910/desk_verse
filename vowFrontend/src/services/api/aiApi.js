const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

const requestAI = async (endpoint, options = {}) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 120000);

  try {
    const response = await fetch(`${AI_API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.message ||
            data?.error ||
            "AI service request failed.";

      throw new Error(message);
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI processing timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const processAudio = async (audioBlob) => {
  if (!audioBlob) {
    throw new Error("Audio recording is missing.");
  }

  const formData = new FormData();

  let extension = "webm";

  if (audioBlob.type.includes("mp4")) {
    extension = "m4a";
  } else if (audioBlob.type.includes("ogg")) {
    extension = "ogg";
  } else if (audioBlob.type.includes("wav")) {
    extension = "wav";
  }

  formData.append("audio", audioBlob, `meeting.${extension}`);

  return requestAI("/api/ai/process", {
    method: "POST",
    body: formData,
  });
};

export default {
  processAudio,
};
