import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/UseAuth";
import { createMeeting } from "../../services/api/meetingApi";

const CreateMeeting = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const meetingData = {
      title,
      description,
      startTime,
      endTime,
      participants,
    };

    try {
      const data = await createMeeting(meetingData, token);

      navigate(`/meetings/${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Meeting</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Meeting title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <textarea
          placeholder="Meeting description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />

        <input
          type="datetime-local"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter participant ID"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (event.target.value.trim()) {
                setParticipants((previous) => [
                  ...previous,
                  event.target.value.trim(),
                ]);

                event.target.value = "";
              }
            }
          }}
        />

        <div>
          <h3>Selected Participants</h3>

          {participants.map((participant) => (
            <div key={participant}>
              <span>{participant}</span>

              <button
                type="button"
                onClick={() => {
                  setParticipants((previous) =>
                    previous.filter((item) => item !== participant)
                  );
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>
    </div>
  );
};

export default CreateMeeting;