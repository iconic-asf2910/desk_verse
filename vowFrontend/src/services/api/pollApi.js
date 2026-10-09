import apiRequest from "../api";

const getPolls = async (workspaceId) => {
  return await apiRequest(
    `/api/polls?workspaceId=${encodeURIComponent(
      workspaceId
    )}`
  );
};

const getPoll = async (pollId) => {
  return await apiRequest(`/api/polls/${pollId}`);
};

const createPoll = async (pollData) => {
  return await apiRequest("/api/polls", {
    method: "POST",
    body: JSON.stringify(pollData),
  });
};

const votePoll = async (
  pollId,
  option
) => {
  return await apiRequest(
    `/api/polls/${pollId}/vote`,
    {
      method: "POST",
      body: JSON.stringify({
        option,
      }),
    }
  );
};

const closePoll = async (pollId) => {
  return await apiRequest(
    `/api/polls/${pollId}/close`,
    {
      method: "PUT",
    }
  );
};

export {
  getPolls,
  getPoll,
  createPoll,
  votePoll,
  closePoll,
};