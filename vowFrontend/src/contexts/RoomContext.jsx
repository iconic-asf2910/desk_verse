import {
  createContext,
  useEffect,
  useState,
} from "react";

import useWorkspace from "../hooks/UseWorkspace";

import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../services/api/roomApi";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const { workspace } = useWorkspace();

  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] =
    useState(false);
  const [roomError, setRoomError] =
    useState("");

  const workspaceId = workspace?.id || null;

  const loadRooms = async () => {
    if (!workspaceId) {
      setRooms([]);
      setRoom(null);
      return;
    }

    try {
      setLoadingRooms(true);
      setRoomError("");

      const data = await getRooms(workspaceId);

      const list = Array.isArray(data) ? data : [];

      setRooms(list);

      setRoom((current) =>
        list.find(
          (item) =>
            String(item.id) ===
            String(current?.id)
        ) ||
        list[0] ||
        null
      );
    } catch (error) {
      setRoomError(error.message);
      setRooms([]);
      setRoom(null);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [workspaceId]);

  const selectRoom = (roomId) => {
    const selected = rooms.find(
      (item) =>
        String(item.id) === String(roomId)
    );

    if (selected) {
      setRoom(selected);
    }
  };

  const addRoom = async (
    name,
    roomData = {}
  ) => {
    if (!workspaceId) {
      throw new Error(
        "No workspace selected."
      );
    }

    const created = await createRoom(
      workspaceId,
      {
        name: name.trim(),
        description:
          roomData.description || "",
        type:
          roomData.type || "general",
      }
    );

    setRooms((previous) => [
      ...previous,
      created,
    ]);

    setRoom(created);

    return created;
  };

  const editRoom = async (
    roomId,
    data
  ) => {
    const updated = await updateRoom(
      roomId,
      data
    );

    setRooms((previous) =>
      previous.map((item) =>
        item.id === roomId
          ? updated
          : item
      )
    );

    setRoom((current) =>
      current?.id === roomId
        ? updated
        : current
    );

    return updated;
  };

  const removeRoom = async (roomId) => {
    await deleteRoom(roomId);

    setRooms((previous) =>
      previous.filter(
        (item) => item.id !== roomId
      )
    );

    setRoom((current) =>
      current?.id === roomId
        ? null
        : current
    );
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        setRooms,
        room,
        setRoom,
        workspaceId,
        selectRoom,
        addRoom,
        updateRoom: editRoom,
        removeRoom,
        loadRooms,
        loadingRooms,
        roomError,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export {
  RoomContext,
  RoomProvider,
};