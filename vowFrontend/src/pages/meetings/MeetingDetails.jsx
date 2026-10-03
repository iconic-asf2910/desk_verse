import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const MeetingDetails = () => {
  const { id } = useParams();

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
      <h1>{meeting.title}</h1>

      <p>{meeting.description}</p>

      <p>Meeting ID: {meeting.id}</p>

      <p>Start Time: {meeting.startTime}</p>

      <p>End Time: {meeting.endTime}</p>

      <p>
        Participants:{" "}
        {meeting.participants.length > 0
          ? meeting.participants.join(", ")
          : "No participants"}
      </p>

      <button>Join Meeting</button>
    </div>
  );
};

export default MeetingDetails;