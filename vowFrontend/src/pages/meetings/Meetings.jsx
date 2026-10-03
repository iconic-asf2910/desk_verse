import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import { getMeetings } from "../../services/api/meetingApi";

const Meetings = () => {
  const { token } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await getMeetings(token);
        setMeetings(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadMeetings();
    }
  }, [token]);

  if (loading) {
    return <p>Loading meetings...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Meetings</h1>

      <Link to="/meetings/create">
        Create Meeting
      </Link>

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