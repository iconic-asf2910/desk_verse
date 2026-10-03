import { createContext, useState } from "react";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);

  return (
    <RoomContext.Provider
      value={{
        rooms,
        setRooms,
        room,
        setRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext, RoomProvider };