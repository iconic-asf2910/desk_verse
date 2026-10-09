import apiRequest from "../api";

const getMeetings = async (workspaceId) => {
  return await apiRequest(
    `/api/meetings?workspaceId=${encodeURIComponent(
      workspaceId
    )}`
  );
};

const getMeeting = async (meetingId) => {
  return await apiRequest(
    `/api/meetings/${meetingId}`
  );
};

const createMeeting = async (
  meetingData
) => {
  return await apiRequest("/api/meetings", {
    method: "POST",
    body: JSON.stringify(meetingData),
  });
};

const updateMeeting = async (
  meetingId,
  meetingData
) => {
  return await apiRequest(
    `/api/meetings/${meetingId}`,
    {
      method: "PUT",
      body: JSON.stringify(meetingData),
    }
  );
};

const deleteMeeting = async (meetingId) => {
  return await apiRequest(
    `/api/meetings/${meetingId}`,
    {
      method: "DELETE",
    }
  );
};

export {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
};