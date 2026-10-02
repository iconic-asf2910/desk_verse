import useRoom from "../../hooks/UseRoom";

const RoomList = () => {
  const { rooms } = useRoom();

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id}>
          {room.name}
        </div>
      ))}
    </div>
  );
};

export default RoomList;