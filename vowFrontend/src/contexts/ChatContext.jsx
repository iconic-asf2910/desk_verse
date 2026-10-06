import {
  createContext,
  useEffect,
  useState,
} from "react";
import useWorkspace from "../hooks/UseWorkspace";
import useRoom from "../hooks/UseRoom";
import useAuth from "../hooks/UseAuth";
import {
  getMessages,
  createMessage,
} from "../services/api/messageApi";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const { workspace } = useWorkspace();
  const { rooms } = useRoom();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [activeRoomId, setActiveRoomId] =
    useState(null);
  const [loadingMessages, setLoadingMessages] =
    useState(false);
  const [chatError, setChatError] =
    useState("");

  useEffect(() => {
    if (rooms.length === 0) {
      setActiveRoomId(null);
      return;
    }

    setActiveRoomId((current) => {
      const exists = rooms.some(
        (room) => room.id === current
      );

      return exists ? current : rooms[0].id;
    });
  }, [rooms]);

  const loadMessages = async () => {
    if (!workspace?.id) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setChatError("");

      const data = await getMessages(
        workspace.id,
        activeRoomId
      );

      setMessages(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setChatError(error.message);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [
    workspace?.id,
    activeRoomId,
  ]);

  const sendMessage = async ({
    roomId,
    message,
  }) => {
    if (!workspace?.id) {
      throw new Error(
        "No workspace selected."
      );
    }

    if (!message.trim()) {
      return;
    }

    const created = await createMessage(
      workspace.id,
      roomId,
      message.trim()
    );

    setMessages((previous) => [
      ...previous,
      created,
    ]);

    return created;
  };

  const activeRoom =
    rooms.find(
      (room) => room.id === activeRoomId
    ) || null;

  const activeRoomMessages =
    messages.filter(
      (message) =>
        !activeRoomId ||
        message.roomId === activeRoomId
    );

  const chatRooms = rooms.map((room) => ({
    ...room,
    messages: messages.filter(
      (message) =>
        message.roomId === room.id
    ),
  }));

  return (
    <ChatContext.Provider
      value={{
        rooms: chatRooms,
        activeRoom,
        activeRoomId,
        setActiveRoomId,
        messages: activeRoomMessages,
        sendMessage,
        loadMessages,
        loadingMessages,
        chatError,
        user,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export {
  ChatContext,
  ChatProvider,
};