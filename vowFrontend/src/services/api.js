const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("token");

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          ...(options.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
          ...options.headers,
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Check that the backend is running."
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const data =
    contentType.includes(
      "application/json"
    )
      ? await response
          .json()
          .catch(() => null)
      : await response
          .text()
          .catch(() => "");

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw new Error(
      data?.message ||
        data?.error ||
        "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        (typeof data === "string"
          ? data
          : "") ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

export default apiRequest;