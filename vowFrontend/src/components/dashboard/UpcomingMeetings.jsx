import { useNavigate } from "react-router-dom";
import meetings from "../../data/meetings";

const UpcomingMeetings = () => {
  const navigate = useNavigate();

  const handleMeetingClick = (meeting) => {
    navigate(`/meetings/${meeting.id}`);
  };

  return (
    <section>
      <h2>Upcoming Meetings</h2>

      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          onClick={() => handleMeetingClick(meeting)}
        >
          <h3>{meeting.title}</h3>
          <p>{meeting.description}</p>
          <p>{meeting.startTime}</p>
        </div>
      ))}
    </section>
  );
};

export default UpcomingMeetings;