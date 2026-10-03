import { useParams } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";
import RoomHeader from "../../components/room/RoomHeader";
import RoomMembers from "../../components/room/RoomMembers";
import RoomPresence from "../../components/room/RoomPresence";
import RoomChat from "../../components/room/RoomChat";
import RoomMeeting from "../../components/room/RoomMeeting";

const RoomDetails = () => {
  const { id } = useParams();
  const { rooms } = useRoom();

  const currentRoom = rooms.find(
    (room) => String(room.id) === String(id)
  );

  return (
    <div>
      <RoomHeader room={currentRoom} />

      <RoomMembers room={currentRoom} />
      <RoomPresence room={currentRoom} />
      <RoomChat room={currentRoom} />
      <RoomMeeting room={currentRoom} />
    </div>
  );
};

export default RoomDetails;