import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";

const Rooms = () => {
  const { rooms } = useRoom();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Rooms</h1>

      {rooms.length === 0 ? (
        <p>No rooms available.</p>
      ) : (
        rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => navigate(`/rooms/${room.id}`)}
          >
            {room.name}
          </button>
        ))
      )}
    </div>
  );
};

export default Rooms;