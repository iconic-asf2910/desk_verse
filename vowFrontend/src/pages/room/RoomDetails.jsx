import { useParams } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";

import RoomHeader from "../../components/room/RoomHeader";
import RoomMembers from "../../components/room/RoomMembers";
import RoomPresence from "../../components/room/RoomPresence";
import RoomChat from "../../components/room/RoomChat";
import RoomMeeting from "../../components/room/RoomMeeting";

const RoomDetails = () => {
  const { id } = useParams();
  const { room, rooms } = useRoom();

  const currentRoom =
    room || rooms.find((item) => String(item.id) === String(id));

  return (
    <div>
      <RoomHeader />

      <h2>{currentRoom?.name || "Room"}</h2>
      <p>Room ID: {id}</p>

      <RoomMembers />
      <RoomPresence />
      <RoomChat />
      <RoomMeeting />
    </div>
  );
};

export default RoomDetails;