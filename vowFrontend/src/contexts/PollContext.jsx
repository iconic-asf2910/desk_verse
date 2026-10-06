import { createContext, useEffect, useState } from "react";

const PollContext = createContext();

const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState(() => {
    const savedPolls = localStorage.getItem("DeskVerse_polls");
    return savedPolls ? JSON.parse(savedPolls) : [];
  });

  useEffect(() => {
    localStorage.setItem("DeskVerse_polls", JSON.stringify(polls));
  }, [polls]);

  const addPoll = ({ question, options, createdBy }) => {
    const newPoll = {
      id: crypto.randomUUID(),
      question,
      options: options.map((option) => ({
        id: crypto.randomUUID(),
        text: option,
        votes: 0,
        voters: [],
      })),
      createdBy,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    setPolls((previousPolls) => [newPoll, ...previousPolls]);
  };

  const votePoll = (pollId, optionId, voterId) => {
    setPolls((previousPolls) =>
      previousPolls.map((poll) => {
        if (poll.id !== pollId || poll.status === "Closed") {
          return poll;
        }

        const previousOption = poll.options.find((option) =>
          option.voters.includes(voterId),
        );

        if (previousOption?.id === optionId) {
          return poll;
        }

        return {
          ...poll,
          options: poll.options.map((option) => {
            const wasSelected = option.voters.includes(voterId);

            const isNewSelection = option.id === optionId;

            if (wasSelected) {
              return {
                ...option,
                votes: Math.max(0, option.votes - 1),
                voters: option.voters.filter((id) => id !== voterId),
              };
            }

            if (isNewSelection) {
              return {
                ...option,
                votes: option.votes + 1,
                voters: [...option.voters, voterId],
              };
            }

            return option;
          }),
        };
      }),
    );
  };

  const closePoll = (pollId) => {
    setPolls((previousPolls) =>
      previousPolls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              status: "Closed",
            }
          : poll,
      ),
    );
  };

  const deletePoll = (pollId) => {
    setPolls((previousPolls) =>
      previousPolls.filter((poll) => poll.id !== pollId),
    );
  };

  return (
    <PollContext.Provider
      value={{
        polls,
        addPoll,
        votePoll,
        closePoll,
        deletePoll,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export { PollContext, PollProvider };
