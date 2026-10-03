import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMeetings, saveMeetings } from "../../utils/meetingStorage";

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    const meetingData = {
      id: Date.now().toString(),
      title,
      description,
      startTime,
      endTime,
      participants,
    };

    const existingMeetings = getMeetings();

    saveMeetings([...existingMeetings, meetingData]);

    navigate(`/meetings/${meetingData.id}`);
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

        <button type="submit">Create Meeting</button>
      </form>
    </div>
  );
};

export default CreateMeeting;