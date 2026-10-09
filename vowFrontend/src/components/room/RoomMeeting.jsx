import { useNavigate } from "react-router-dom";

const RoomMeeting = ({ room, meeting, loading }) => {
  const navigate = useNavigate();

  const handleJoinMeeting = () => {
    if (!meeting?.id) {
      return;
    }

    navigate(`/meetings/${meeting.id}`);
  };

  return (
    <div>
      <p className="mb-2 text-sm text-slate-500">
        Start or join a meeting in {room?.name || "this room"}.
      </p>

      <button
        type="button"
        onClick={handleJoinMeeting}
        disabled={loading || !meeting}
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading
          ? "Loading..."
          : meeting
            ? "Join Meeting"
            : "No Meeting"}
      </button>
    </div>
  );
};

export default RoomMeeting;