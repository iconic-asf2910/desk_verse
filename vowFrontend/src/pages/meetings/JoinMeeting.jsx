import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const JoinMeeting = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    const meetings = getMeetings();

    const selectedMeeting = meetings.find(
      (item) => String(item.id) === String(id)
    );

    setMeeting(selectedMeeting);
  }, [id]);

  if (!meeting) {
    return <p>Meeting not found.</p>;
  }

  return (
    <div>
      <h1>Meeting Room</h1>

      <h2>{meeting.title}</h2>

      <p>Meeting ID: {meeting.id}</p>

      <button
        type="button"
        onClick={() => navigate(`/meetings/${meeting.id}`)}
      >
        Leave Meeting
      </button>
    </div>
  );
};

export default JoinMeeting;