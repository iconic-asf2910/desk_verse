import { createContext, useState } from "react";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: "Design Studio",
      people: ["Sarah", "Mike"],
    },
    {
      id: 2,
      name: "Meeting Pod A",
      people: ["Alex"],
    },
    {
      id: 3,
      name: "Meeting Pod B",
      people: ["Emma"],
    },
    {
      id: 4,
      name: "The Lounge",
      people: ["Sophia"],
    },
    {
      id: 5,
      name: "Engineering Bay",
      people: ["David"],
    },
    {
      id: 6,
      name: "Quiet Room",
      people: ["Ryan"],
    },
  ]);

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