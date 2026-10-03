import { useEffect } from "react";
import { useParams } from "react-router-dom";

import useRoom from "../../hooks/UseRoom";
import useAuth from "../../hooks/UseAuth";
import useWebSocket from "../../hooks/UseWebSocket";

import RoomHeader from "../../components/room/RoomHeader";
import RoomMembers from "../../components/room/RoomMembers";
import RoomPresence from "../../components/room/RoomPresence";
import RoomChat from "../../components/room/RoomChat";
import RoomMeeting from "../../components/room/RoomMeeting";

const RoomDetails = () => {
  const { id } = useParams();
  const { room, rooms } = useRoom();
  const { token } = useAuth();
  const { connect, disconnect, sendMessage } = useWebSocket();

  const currentRoom =
    room || rooms.find((item) => String(item.id) === String(id));

  useEffect(() => {
    if (!token) return;

    const connectToRoom = async () => {
      try {
        await connect("BACKEND_WS_URL", token);

        console.log("Connected to room WebSocket");

        // Backend event format will be finalized later.
        sendMessage({
          type: "room_join",
          roomId: id,
        });
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
      }
    };

    connectToRoom();

    return () => {
      sendMessage({
        type: "room_leave",
        roomId: id,
      });

      disconnect();
    };
  }, [token, id]);

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