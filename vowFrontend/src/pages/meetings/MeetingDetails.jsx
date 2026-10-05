import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeeting } from "../../services/api/meetingApi";

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMeeting(id);

        setMeeting(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
        <p className="text-sm text-slate-500">
          Loading meeting...
        </p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
        <button
          type="button"
          onClick={() => navigate("/meetings")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Meetings
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Meeting not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The meeting does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);
  const participants = meeting.participants || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-5 py-5">
      <button
        type="button"
        onClick={() => navigate("/meetings")}
        className="mb-5 text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to Meetings
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {meeting.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {meeting.description || "Virtual Meeting"}
            </p>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {meeting.status || "Scheduled"}
          </span>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Date
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {startDate.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Time
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {startDate.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {endDate.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Meeting Code
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {meeting.meetingCode || "Not available"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Participants
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
              {participants.length}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-base font-medium text-slate-800">
            Participants
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {participants.length === 0 ? (
              <p className="text-sm text-slate-500">
                No participants added.
              </p>
            ) : (
              participants.map((participant, index) => (
                <div
                  key={`${participant}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
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

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/meetings")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/meetings/${meeting.id}/join`)
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;