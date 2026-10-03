import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    const meetings = getMeetings();

    const selectedMeeting = meetings.find(
      (item) => String(item.id) === String(id),
    );

    setMeeting(selectedMeeting);
  }, [id]);

  if (!meeting) {
    return <p>Meeting not found.</p>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <h1 className="text-2xl font-semibold text-slate-900">{meeting.title}</h1>

      <p className="mt-3 text-slate-600">{meeting.description}</p>

      <div className="mt-6 space-y-3">
        <p className="text-sm text-slate-700">
          <span className="font-medium">Meeting ID:</span> {meeting.id}
        </p>

        <p className="text-sm text-slate-700">
          <span className="font-medium">Start Time:</span> {meeting.startTime}
        </p>

        <p className="text-sm text-slate-700">
          <span className="font-medium">End Time:</span> {meeting.endTime}
        </p>

        <p className="text-sm text-slate-700">
          <span className="font-medium">Participants:</span>{" "}
          {meeting.participants.length > 0
            ? meeting.participants.join(", ")
            : "No participants"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/meetings/${meeting.id}/join`)}
        className="mt-7 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Join Meeting
      </button>
    </div>
  );
};

export default MeetingDetails;
