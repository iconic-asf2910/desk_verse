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
        <div>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
            >
              {room.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;