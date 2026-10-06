import {
  createContext,
  useEffect,
  useState,
} from "react";
import useWorkspace from "../hooks/UseWorkspace";
import useAuth from "../hooks/UseAuth";
import {
  getPolls,
  createPoll,
  votePoll,
  closePoll,
} from "../services/api/pollApi";

const PollContext = createContext();

const PollProvider = ({ children }) => {
  const { workspace } = useWorkspace();
  const { user } = useAuth();

  const [polls, setPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] =
    useState(false);
  const [pollError, setPollError] =
    useState("");

  const loadPolls = async () => {
    if (!workspace?.id) {
      setPolls([]);
      return;
    }

    try {
      setLoadingPolls(true);
      setPollError("");

      const data = await getPolls(
        workspace.id
      );

      setPolls(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setPollError(error.message);
      setPolls([]);
    } finally {
      setLoadingPolls(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [workspace?.id]);

  const addPoll = async ({
    question,
    options,
    eligibleUsers = [],
    expiresAt = "",
  }) => {
    if (!workspace?.id) {
      throw new Error(
        "No workspace selected."
      );
    }

    const poll = await createPoll({
      workspaceId: workspace.id,
      question: question.trim(),
      options: options.map((option) =>
        option.trim()
      ),
      eligibleUsers,
      expiresAt,
    });

    setPolls((previous) => [
      poll,
      ...previous,
    ]);

    return poll;
  };

  const votePollOption = async (
    pollId,
    option
  ) => {
    const updated = await votePoll(
      pollId,
      option
    );

    setPolls((previous) =>
      previous.map((poll) =>
        poll.id === pollId
          ? updated
          : poll
      )
    );

    return updated;
  };

  const closePollOption = async (
    pollId
  ) => {
    const closed = await closePoll(
      pollId
    );

    setPolls((previous) =>
      previous.map((poll) =>
        poll.id === pollId
          ? closed
          : poll
      )
    );

    return closed;
  };

  const hasVoted = (poll) => {
    if (!user?.id) {
      return false;
    }

    return Boolean(
      poll.votes?.some(
        (vote) =>
          vote.userId === user.id
      )
    );
  };

  const getUserVote = (poll) => {
    if (!user?.id) {
      return null;
    }

    return (
      poll.votes?.find(
        (vote) =>
          vote.userId === user.id
      )?.option || null
    );
  };

  return (
    <PollContext.Provider
      value={{
        polls,
        addPoll,
        votePoll: votePollOption,
        closePoll: closePollOption,
        hasVoted,
        getUserVote,
        loadPolls,
        loadingPolls,
        pollError,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export {
  PollContext,
  PollProvider,
};