import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMeetings } from "../../utils/meetingStorage";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  return (
    <div>
      <h1>Meetings</h1>

      <Link to="/meetings/create">Create Meeting</Link>

      {meetings.length === 0 ? (
        <p>No meetings found.</p>
      ) : (
        meetings.map((meeting) => (
          <div key={meeting.id}>
            <h2>{meeting.title}</h2>
            <p>{meeting.description}</p>
            <p>{meeting.startTime}</p>

            <Link to={`/meetings/${meeting.id}`}>
              View Meeting
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Meetings;