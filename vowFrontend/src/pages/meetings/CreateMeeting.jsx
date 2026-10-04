import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMeetings, saveMeetings } from "../../utils/meetingStorage";

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");

  const addParticipant = () => {
    const participant = participantInput.trim();

    if (!participant) return;

    if (participants.includes(participant)) {
      setParticipantInput("");
      return;
    }

    setParticipants((previousParticipants) => [
      ...previousParticipants,
      participant,
    ]);

    setParticipantInput("");
  };

  const removeParticipant = (participant) => {
    setParticipants((previousParticipants) =>
      previousParticipants.filter((item) => item !== participant)
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    const meetingData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      startTime,
      endTime,
      participants,
    };

    const existingMeetings = getMeetings();

    saveMeetings([...existingMeetings, meetingData]);

    navigate(`/meetings/${meetingData.id}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/meetings")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Meetings
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-900">
              Schedule New Meeting
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a meeting and invite participants.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meeting Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter meeting title"
                required
                className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter meeting description"
                rows="4"
                required
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Time
                </label>

                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End Time
                </label>

                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  required
                  className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Participants
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(event) =>
                    setParticipantInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addParticipant();
                    }
                  }}
                  placeholder="Enter participant ID"
                  className="min-w-0 flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={addParticipant}
                  className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add
                </button>
              </div>

              {participants.length > 0 && (
                <div className="mt-3 space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm text-slate-700">
                        {participant}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeParticipant(participant)
                        }
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => navigate("/meetings")}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Meeting
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;