import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Meetings
        </h1>

        <Link
          to="/meetings/create"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Meeting
        </Link>
      </div>

      <div className="mt-6">
        {meetings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No meetings found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-base font-semibold text-slate-900">
                  {meeting.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {meeting.description}
                </p>

                <p className="mt-4 text-sm text-slate-600">
                  Starts: {meeting.startTime}
                </p>

                <Link
                  to={`/meetings/${meeting.id}`}
                  className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View Meeting →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;