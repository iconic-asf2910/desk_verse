import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMeetings } from "../../services/api/meetingApi";
import useWorkspace from "../../hooks/UseWorkspace";

const UpcomingMeetings = () => {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeetings = async () => {
      if (!workspace?.id) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMeetings(workspace.id);
        setMeetings(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [workspace?.id]);

  if (loading) {
    return <p>Loading meetings...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h2>Upcoming Meetings</h2>

      {meetings.length === 0 ? (
        <p>No upcoming meetings.</p>
      ) : (
        meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => navigate(`/meetings/${meeting.id}`)}
          >
            <h3>{meeting.title}</h3>
            <p>{meeting.description}</p>
            <p>{meeting.startTime}</p>
          </div>
        ))
      )}
    </section>
  );
};

export default UpcomingMeetings;