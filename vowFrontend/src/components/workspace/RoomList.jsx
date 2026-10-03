import useRoom from "../../hooks/UseRoom";
import { useNavigate } from "react-router-dom";

const RoomList = () => {
  const { rooms, setRoom } = useRoom();
  const navigate = useNavigate();

  const handleSelectRoom = (room) => {
    setRoom(room);
    navigate(`/rooms/${room.id}`);
  };

  return (
    <div>
      <h2>Rooms</h2>

      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => handleSelectRoom(room)}
        >
          {room.name}
        </div>
      ))}
    </div>
  );
};

export default RoomList;