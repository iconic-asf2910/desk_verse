import { useState } from "react";

const initialPolls = [
  {
    id: 1,
    title: "Preferred day for Q4 All-Hands?",
    createdBy: "Mike",
    participants: 45,
    question: "Which day of the week works best for you?",
    options: [
      { id: 1, label: "Wednesday", votes: 25 },
      { id: 2, label: "Thursday", votes: 12 },
      { id: 3, label: "Friday", votes: 8 },
    ],
  },
  {
    id: 2,
    title: "Best day for team collaboration?",
    createdBy: "Sarah",
    participants: 32,
    question: "Which day works best for team collaboration?",
    options: [
      { id: 1, label: "Monday", votes: 8 },
      { id: 2, label: "Tuesday", votes: 16 },
      { id: 3, label: "Thursday", votes: 8 },
    ],
  },
  {
    id: 3,
    title: "How is your workload?",
    createdBy: "Anonymous Poll",
    participants: 58,
    question: "How's your work load this week?",
    options: [
      { id: 1, label: "Manageable", votes: 36 },
      { id: 2, label: "Heavy", votes: 16 },
      { id: 3, label: "Overwhelmed", votes: 5 },
      { id: 4, label: "Unbalanced", votes: 1 },
    ],
  },
  {
    id: 4,
    title: "Preferred meeting style?",
    createdBy: "Alex",
    participants: 41,
    question: "Which meeting style do you prefer?",
    options: [
      { id: 1, label: "In-person", votes: 18 },
      { id: 2, label: "Video Call", votes: 15 },
      { id: 3, label: "Hybrid", votes: 8 },
    ],
  },
  {
    id: 5,
    title: "Best time for team meetings?",
    createdBy: "David",
    participants: 29,
    question: "What time works best for team meetings?",
    options: [
      { id: 1, label: "Morning", votes: 12 },
      { id: 2, label: "Afternoon", votes: 10 },
      { id: 3, label: "Evening", votes: 7 },
    ],
  },
];

const leaderboard = [
  {
    rank: 1,
    name: "Sarah",
    points: 125,
    avatar: "/boy1.png",
  },
  {
    rank: 2,
    name: "Mike",
    points: 110,
    avatar: "/boy2.png",
  },
  {
    rank: 3,
    name: "David",
    points: 95,
    avatar: "/boy4.png",
  },
];

const Polls = () => {
  const [polls, setPolls] = useState(initialPolls);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votedPolls, setVotedPolls] = useState({});

  const getTotalVotes = (poll) => {
    return poll.options.reduce(
      (total, option) => total + option.votes,
      0
    );
  };

  const handleOptionChange = (pollId, optionId) => {
    setSelectedOptions((previous) => ({
      ...previous,
      [pollId]: optionId,
    }));
  };

  const handleVote = (pollId) => {
    const selectedOption = selectedOptions[pollId];

    if (!selectedOption || votedPolls[pollId]) {
      return;
    }

    setPolls((previousPolls) =>
      previousPolls.map((poll) => {
        if (poll.id !== pollId) {
          return poll;
        }

        return {
          ...poll,
          options: poll.options.map((option) =>
            option.id === selectedOption
              ? {
                  ...option,
                  votes: option.votes + 1,
                }
              : option
          ),
        };
      })
    );

    setVotedPolls((previous) => ({
      ...previous,
      [pollId]: true,
    }));
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc]">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <p className="text-xs text-slate-500">Acme Corp HQ</p>

            <h1 className="text-xl font-semibold text-slate-900">
              Engagement Hub
            </h1>
          </div>

          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            My Active Polls
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Active Polls
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Share your opinion with the team.
            </p>
          </div>

          <div className="flex w-full gap-4 overflow-x-auto pb-4">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const selectedOption = selectedOptions[poll.id];
              const hasVoted = votedPolls[poll.id];

              return (
                <section
                  key={poll.id}
                  className="w-[320px] shrink-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {poll.title}
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Created by {poll.createdBy} ·{" "}
                        {poll.participants} participants
                      </p>
                    </div>

                    {hasVoted && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-600">
                        Voted
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-800">
                    {poll.question}
                  </p>

                  <div className="mt-4 space-y-3">
                    {poll.options.map((option) => {
                      const percentage =
                        totalVotes > 0
                          ? Math.round(
                              (option.votes / totalVotes) * 100
                            )
                          : 0;

                      return (
                        <label key={option.id} className="block">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`poll-${poll.id}`}
                              value={option.id}
                              checked={
                                selectedOption === option.id
                              }
                              disabled={hasVoted}
                              onChange={() =>
                                handleOptionChange(
                                  poll.id,
                                  option.id
                                )
                              }
                              className="h-3.5 w-3.5 accent-slate-800"
                            />

                            <span className="flex-1 text-[11px] text-slate-700">
                              {option.label}
                            </span>

                            {hasVoted && (
                              <span className="text-[10px] text-slate-500">
                                {percentage}%
                              </span>
                            )}
                          </div>

                          {hasVoted && (
                            <div className="ml-5 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {!hasVoted && (
                    <button
                      type="button"
                      onClick={() => handleVote(poll.id)}
                      disabled={!selectedOption}
                      className="mt-5 rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Submit Vote
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-1 text-[10px] text-slate-400">
            Scroll horizontally to view more polls →
          </p>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Leaderboard
              </h2>
            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              {leaderboard.map((person) => (
                <div
                  key={person.rank}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <span className="w-8 text-xs font-semibold text-slate-400">
                    {person.rank === 1
                      ? "1st"
                      : person.rank === 2
                      ? "2nd"
                      : "3rd"}
                  </span>

                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {person.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      Rank #{person.rank}
                    </p>
                  </div>

                  <span className="text-[10px] font-medium text-slate-500">
                    {person.points} pts.
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Polls;