import { createContext, useEffect, useState } from "react";
import {
  getRooms,
  createRoom,
  deleteRoom,
} from "../services/api/roomApi";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setRooms([]);
      return;
    }

    const loadRooms = async () => {
      try {
        setLoadingRooms(true);
        setRoomError("");

        const data = await getRooms(workspaceId);

        setRooms(data);
      } catch (error) {
        setRoomError(error.message);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, [workspaceId]);

  const addRoom = async (name) => {
    if (!workspaceId || !name.trim()) return;

    try {
      setRoomError("");

      const newRoom = await createRoom(workspaceId, {
        name: name.trim(),
        description: "",
        type: "general",
      });

      setRooms((previousRooms) => [
        ...previousRooms,
        newRoom,
      ]);
    } catch (error) {
      setRoomError(error.message);
    }
  };

  const removeRoom = async (roomId) => {
    try {
      setRoomError("");

      await deleteRoom(roomId);

      setRooms((previousRooms) =>
        previousRooms.filter((item) => item.id !== roomId)
      );
    } catch (error) {
      setRoomError(error.message);
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        setRooms,
        room,
        setRoom,
        workspaceId,
        setWorkspaceId,
        addRoom,
        removeRoom,
        roomError,
        loadingRooms,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext, RoomProvider };