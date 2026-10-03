import { Link } from "react-router-dom";
import meetings from "../../data/meetings";

const Meetings = () => {
  return (
    <div>
      <h1>Meetings</h1>

      <Link to="/meetings/create">
        Create Meeting
      </Link>

      {meetings.map((meeting) => (
        <div key={meeting.id}>
          <h2>{meeting.title}</h2>

          <p>{meeting.description}</p>

          <p>{meeting.startTime}</p>

          <Link to={`/meetings/${meeting.id}`}>
            View Meeting
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Meetings;