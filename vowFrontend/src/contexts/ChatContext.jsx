import { createContext, useEffect, useState } from "react";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("DeskVerse_chat_rooms");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "general",
            name: "General",
            messages: [],
          },
        ];
  });

  const [activeRoomId, setActiveRoomId] = useState("general");

  useEffect(() => {
    localStorage.setItem("DeskVerse_chat_rooms", JSON.stringify(rooms));
  }, [rooms]);

  const sendMessage = ({ roomId, sender, message }) => {
    if (!message.trim()) {
      return;
    }

    const newMessage = {
      id: crypto.randomUUID(),
      sender,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setRooms((previousRooms) =>
      previousRooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              messages: [...room.messages, newMessage],
            }
          : room,
      ),
    );
  };

  const createChatRoom = (name) => {
    if (!name.trim()) {
      return;
    }

    const room = {
      id: crypto.randomUUID(),
      name: name.trim(),
      messages: [],
    };

    setRooms((previousRooms) => [...previousRooms, room]);

    setActiveRoomId(room.id);
  };

  const activeRoom = rooms.find((room) => room.id === activeRoomId) || rooms[0];

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        activeRoomId,
        setActiveRoomId,
        sendMessage,
        createChatRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
