import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";

const RoomList = () => {
  const { rooms } = useRoom();
  const navigate = useNavigate();

  return (
    <section>
      <h2>Rooms</h2>

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
    </section>
  );
};

export default RoomList;