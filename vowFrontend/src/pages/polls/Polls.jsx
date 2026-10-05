import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import useAuth from "../../hooks/UseAuth";

const initialPolls = [
  {
    id: 1,
    title: "Preferred day for Q4 All-Hands?",
    createdBy: "Team Member",
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
    createdBy: "Team Member",
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
    createdBy: "Team Member",
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
    createdBy: "Team Member",
    participants: 29,
    question: "What time works best for team meetings?",
    options: [
      { id: 1, label: "Morning", votes: 12 },
      { id: 2, label: "Afternoon", votes: 10 },
      { id: 3, label: "Evening", votes: 7 },
    ],
  },
];

const barColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
];

const Polls = () => {
  const { user } = useAuth();

  const currentUserName = user?.name || "User";

  const [polls, setPolls] = useState(initialPolls);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [votedPolls, setVotedPolls] = useState({});
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

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
          participants: poll.participants + 1,
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

  const handleAddOption = () => {
    setOptions((previous) => [...previous, ""]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions((previous) =>
      previous.filter((_, optionIndex) => optionIndex !== index)
    );
  };

  const handleOptionInput = (index, value) => {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option
      )
    );
  };

  const handleCreatePoll = (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    const trimmedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (!trimmedQuestion || trimmedOptions.length < 2) {
      return;
    }

    const newPoll = {
      id: Date.now(),
      title: trimmedQuestion,
      createdBy: currentUserName,
      participants: 0,
      question: trimmedQuestion,
      options: trimmedOptions.map((label, index) => ({
        id: index + 1,
        label,
        votes: 0,
      })),
    };

    setPolls((previous) => [newPoll, ...previous]);
    setQuestion("");
    setOptions(["", ""]);
    setShowCreatePoll(false);
  };

  const handleDeletePoll = (pollId) => {
    setPolls((previousPolls) =>
      previousPolls.filter((poll) => poll.id !== pollId)
    );

    setSelectedOptions((previous) => {
      const updated = { ...previous };
      delete updated[pollId];
      return updated;
    });

    setVotedPolls((previous) => {
      const updated = { ...previous };
      delete updated[pollId];
      return updated;
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc]">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <p className="text-xs text-slate-500">
              DeskVerse
            </p>

            <h1 className="text-xl font-semibold text-slate-900">
              Engagement Hub
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowCreatePoll(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Poll
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);
              const selectedOption = selectedOptions[poll.id];
              const hasVoted = votedPolls[poll.id];

              return (
                <section
                  key={poll.id}
                  className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {poll.title}
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Created by {poll.createdBy} ·{" "}
                        {poll.participants} participants
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {hasVoted && (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-600">
                          Voted
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeletePoll(poll.id)}
                        title="Delete poll"
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-800">
                    {poll.question}
                  </p>

                  <div className="mt-4 space-y-3">
                    {poll.options.map((option, index) => {
                      const percentage =
                        totalVotes > 0
                          ? Math.round(
                              (option.votes / totalVotes) * 100
                            )
                          : 0;

                      return (
                        <label
                          key={option.id}
                          className="block"
                        >
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
                              className="h-3.5 w-3.5 accent-blue-600"
                            />

                            <span className="min-w-0 flex-1 text-[11px] text-slate-700">
                              {option.label}
                            </span>

                            {hasVoted && (
                              <span className="text-[10px] font-medium text-slate-500">
                                {percentage}%
                              </span>
                            )}
                          </div>

                          {hasVoted && (
                            <div className="ml-5 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  barColors[
                                    index % barColors.length
                                  ]
                                }`}
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

          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <h2 className="text-base font-semibold text-slate-900">
                Leaderboard
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Top contributors in the workspace
              </p>
            </div>

            <div className="mt-8 flex items-end justify-center gap-2">
              <div className="flex w-28 flex-col items-center">
                <div className="mb-2 text-lg">🥈</div>

                <img
                  src="/manprofile.png"
                  alt="Second place"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-300"
                />

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Team Member
                </p>

                <p className="text-xs text-slate-500">
                  2nd Place
                </p>

                <div className="mt-3 flex h-20 w-full items-end justify-center rounded-t-lg bg-slate-200">
                  <span className="mb-3 text-lg font-bold text-slate-600">
                    2
                  </span>
                </div>
              </div>

              <div className="flex w-32 flex-col items-center">
                <div className="mb-2 text-2xl">🥇</div>

                <img
                  src="/manprofile.png"
                  alt={currentUserName}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-yellow-300"
                />

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {currentUserName}
                </p>

                <p className="text-xs text-slate-500">
                  1st Place
                </p>

                <div className="mt-3 flex h-32 w-full items-end justify-center rounded-t-lg bg-yellow-100">
                  <span className="mb-3 text-xl font-bold text-yellow-600">
                    1
                  </span>
                </div>
              </div>

              <div className="flex w-28 flex-col items-center">
                <div className="mb-2 text-lg">🥉</div>

                <img
                  src="/manprofile.png"
                  alt="Third place"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-300"
                />

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Team Member
                </p>

                <p className="text-xs text-slate-500">
                  3rd Place
                </p>

                <div className="mt-3 flex h-16 w-full items-end justify-center rounded-t-lg bg-orange-100">
                  <span className="mb-3 text-lg font-bold text-orange-600">
                    3
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {showCreatePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Create Poll
              </h2>

              <button
                type="button"
                onClick={() => setShowCreatePoll(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreatePoll}
              className="mt-5"
            >
              <label className="text-sm font-medium text-slate-700">
                Question
              </label>

              <input
                type="text"
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Enter your question..."
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <div className="mt-5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Options
                </label>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus size={14} />
                  Add option
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionInput(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Option ${index + 1}`}
                      className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveOption(index)
                      }
                      disabled={options.length <= 2}
                      title="Remove option"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreatePoll(false)
                  }
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    !question.trim() ||
                    options.filter(
                      (option) => option.trim()
                    ).length < 2
                  }
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Polls;