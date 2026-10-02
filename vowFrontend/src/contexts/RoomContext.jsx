import { createContext, useEffect, useState } from "react";
import { getRooms } from "../services/api/roomApi";
import useAuth from "../hooks/UseAuth";
import useWorkspace from "../hooks/UseWorkspace";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const { token } = useAuth();
  const { workspace } = useWorkspace();

  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
useEffect(() => {
  if (workspace && token) {
    getRooms(workspace.id, token).then((data) => {
      setRooms(data);
    });
  }
}, [workspace, token]);
  return (
    <RoomContext.Provider value={{ rooms, setRooms ,room ,setRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext, RoomProvider };
