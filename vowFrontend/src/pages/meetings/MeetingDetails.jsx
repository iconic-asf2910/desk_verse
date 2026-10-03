import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useAuth from "../../hooks/UseAuth";
import { getMeeting } from "../../services/api/meetingApi";

const MeetingDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const data = await getMeeting(id, token);
        setMeeting(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      loadMeeting();
    }
  }, [id, token]);

  if (loading) {
    return <p>Loading meeting...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>{meeting?.title || "Meeting"}</h1>

      <p>{meeting?.description}</p>

      <p>Meeting ID: {id}</p>

      <button>Join Meeting</button>
    </div>
  );
};

export default MeetingDetails;