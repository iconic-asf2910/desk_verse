import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import usePoll from "../../hooks/UsePoll";
import useAuth from "../../hooks/UseAuth";

const Polls = () => {
  const {
    polls,
    addPoll,
    votePoll,
    closePoll,
    deletePoll,
  } = usePoll();

  const { user } = useAuth();

  const voterId =
    user?.id || user?.email || "guest";

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [optionError, setOptionError] = useState("");

  const filteredPolls = useMemo(() => {
    return polls.filter((poll) => {
      const matchesSearch = poll.question
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        poll.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [polls, search, filter]);

  const addOption = () => {
    setOptions((previousOptions) => [
      ...previousOptions,
      "",
    ]);
    setOptionError("");
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      return;
    }

    setOptions((previousOptions) =>
      previousOptions.filter(
        (_, optionIndex) =>
          optionIndex !== index
      )
    );

    setOptionError("");
  };

  const updateOption = (index, value) => {
    setOptions((previousOptions) =>
      previousOptions.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option
      )
    );

    setOptionError("");
  };

  const handleCreatePoll = (event) => {
    event.preventDefault();

    const cleanQuestion = question.trim();

    const cleanOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    const normalizedOptions = cleanOptions.map(
      (option) => option.toLowerCase()
    );

    const hasDuplicateOptions =
      new Set(normalizedOptions).size !==
      normalizedOptions.length;

    if (!cleanQuestion) {
      setOptionError(
        "Enter a poll question."
      );
      return;
    }

    if (cleanOptions.length < 2) {
      setOptionError(
        "Add at least two options."
      );
      return;
    }

    if (hasDuplicateOptions) {
      setOptionError(
        "Poll options cannot be the same."
      );
      return;
    }

    setOptionError("");

    addPoll({
      question: cleanQuestion,
      options: cleanOptions,
      createdBy: user?.name || "You",
    });

    setQuestion("");
    setOptions(["", ""]);
    setShowCreate(false);
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce(
      (total, option) =>
        total + option.votes,
      0
    );
  };

  const hasVoted = (poll) => {
    return poll.options.some((option) =>
      option.voters.includes(voterId)
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="w-full px-6 py-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Polls
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Create polls, collect votes and view
            results.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreate(true);
            setOptionError("");
          }}
          className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
        >
          <Plus size={17} />
          Create Poll
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Polls
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {polls.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Polls
          </p>

          <p className="mt-2 text-3xl font-semibold text-purple-600">
            {
              polls.filter(
                (poll) =>
                  poll.status === "Active"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Closed Polls
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-600">
            {
              polls.filter(
                (poll) =>
                  poll.status === "Closed"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
        <div className="flex gap-2">
          {["All", "Active", "Closed"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-md px-3 py-2 text-sm ${
                  filter === item
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search polls"
            className="h-9 w-52 rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPolls.length === 0 ? (
          <div className="rounded-xl bg-white px-5 py-12 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No polls found.
            </p>
          </div>
        ) : (
          filteredPolls.map((poll) => {
            const totalVotes =
              getTotalVotes(poll);

            const voted = hasVoted(poll);

            return (
              <section
                key={poll.id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {poll.status ===
                      "Active" ? (
                        <Circle
                          size={10}
                          className="fill-emerald-500 text-emerald-500"
                        />
                      ) : (
                        <CheckCircle2
                          size={15}
                          className="text-slate-400"
                        />
                      )}

                      <span
                        className={`text-xs font-medium ${
                          poll.status ===
                          "Active"
                            ? "text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {poll.status}
                      </span>
                    </div>

                    <h2 className="mt-2 text-lg font-medium text-slate-900">
                      {poll.question}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Created by{" "}
                      {poll.createdBy} ·{" "}
                      {formatDate(
                        poll.createdAt
                      )}{" "}
                      · {totalVotes}{" "}
                      {totalVotes === 1
                        ? "vote"
                        : "votes"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {poll.status ===
                      "Active" && (
                      <button
                        type="button"
                        onClick={() =>
                          closePoll(
                            poll.id
                          )
                        }
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        Close Poll
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deletePoll(poll.id)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {poll.options.map(
                    (option) => {
                      const percentage =
                        totalVotes > 0
                          ? Math.round(
                              (option.votes /
                                totalVotes) *
                                100
                            )
                          : 0;

                      const isSelected =
                        option.voters.includes(
                          voterId
                        );

                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            if (
                              poll.status ===
                              "Active"
                            ) {
                              votePoll(
                                poll.id,
                                option.id,
                                voterId
                              );
                            }
                          }}
                          className={`rounded-lg border p-3 transition ${
                            poll.status ===
                            "Active"
                              ? "cursor-pointer border-slate-200 hover:border-purple-300 hover:bg-purple-50"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                isSelected
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-400 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  size={14}
                                  strokeWidth={
                                    3
                                  }
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-slate-700">
                                  {
                                    option.text
                                  }
                                </span>

                                <span className="shrink-0 text-xs text-slate-500">
                                  {
                                    option.votes
                                  }{" "}
                                  ·{" "}
                                  {
                                    percentage
                                  }
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-purple-500 transition-all"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {voted &&
                  poll.status ===
                    "Active" && (
                    <p className="mt-4 text-xs font-medium text-purple-600">
                      Your vote is recorded.
                      You can change your
                      vote until the poll is
                      closed.
                    </p>
                  )}

                {voted &&
                  poll.status ===
                    "Closed" && (
                    <p className="mt-4 text-xs font-medium text-slate-500">
                      This poll is closed.
                      Your vote can no
                      longer be changed.
                    </p>
                  )}
              </section>
            );
          })
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Poll
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add a question and at least
                  two options.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setOptionError("");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreatePoll}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Question
                </label>

                <input
                  type="text"
                  value={question}
                  onChange={(event) => {
                    setQuestion(
                      event.target.value
                    );
                    setOptionError("");
                  }}
                  placeholder="What should we discuss next?"
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Options
                  </label>

                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs font-medium text-purple-600 hover:text-purple-700"
                  >
                    + Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map(
                    (option, index) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(
                              index,
                              event.target
                                .value
                            )
                          }
                          placeholder={`Option ${
                            index + 1
                          }`}
                          className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-purple-500"
                        />

                        {options.length >
                          2 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeOption(
                                index
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                {optionError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {optionError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setOptionError("");
                  }}
                  className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
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