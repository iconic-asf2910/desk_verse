import { createContext, useEffect, useState } from "react";

const RoomContext = createContext();

const defaultRooms = [
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
];

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    const storedRooms = localStorage.getItem("deskverseRooms");

    if (storedRooms) {
      return JSON.parse(storedRooms);
    }

    return defaultRooms;
  });

  const [room, setRoom] = useState(null);

  useEffect(() => {
    localStorage.setItem("deskverseRooms", JSON.stringify(rooms));
  }, [rooms]);

  const addRoom = (name) => {
    const newRoom = {
      id: Date.now(),
      name: name.trim(),
      people: [],
    };

    setRooms((previousRooms) => [
      ...previousRooms,
      newRoom,
    ]);
  };

  const removeRoom = (roomId) => {
    setRooms((previousRooms) =>
      previousRooms.filter((room) => room.id !== roomId)
    );
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        setRooms,
        room,
        setRoom,
        addRoom,
        removeRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext, RoomProvider };