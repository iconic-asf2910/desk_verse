import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const JoinMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const meetings = getMeetings();

    const selectedMeeting = meetings.find(
      (item) => String(item.id) === String(id)
    );

    setMeeting(selectedMeeting);
  }, [id]);

  if (!meeting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Meeting not found
          </h1>

          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  if (isJoined) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#111827] px-5">
        <div className="w-full max-w-2xl rounded-xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">
            You are in the meeting
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {meeting.title}
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsJoined(false)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Leave Meeting
            </button>

            <button
              type="button"
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Meeting Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(`/meetings/${meeting.id}`)}
          className="mb-5 text-sm text-slate-300 hover:text-white"
        >
          ← Back to Meeting Details
        </button>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900">
              Join Meeting
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {meeting.title}
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs text-slate-500">Meeting</p>

            <p className="mt-1 text-base font-medium text-slate-900">
              {meeting.title}
            </p>

            <p className="mt-4 text-xs text-slate-500">
              Scheduled time
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {new Date(meeting.startTime).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-medium text-slate-800">
              Participants
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {meeting.participants.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No participants added.
                </p>
              ) : (
                meeting.participants.map((participant, index) => (
                  <div
                    key={`${participant}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <img
                      src={`/boy${(index % 6) + 1}.png`}
                      alt={participant}
                      className="h-8 w-8 rounded-full object-cover"
                    />

                    <span className="text-sm text-slate-700">
                      {participant}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsJoined(true)}
            className="mt-8 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;