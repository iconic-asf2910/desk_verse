import { createContext, useEffect, useState } from "react";

import useWorkspace from "../hooks/UseWorkspace";
import useRoom from "../hooks/UseRoom";
import useAuth from "../hooks/UseAuth";

import { getMessages, createMessage } from "../services/api/messageApi";

import { createRoom } from "../services/api/roomApi";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const { workspace } = useWorkspace();
  const { rooms, refreshRooms } = useRoom();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);

  const [loadingMessages, setLoadingMessages] = useState(false);

  const [chatError, setChatError] = useState("");

  /*
   * Select the first room when rooms become available.
   */
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      setActiveRoomId(null);
      setMessages([]);
      return;
    }

    setActiveRoomId((current) => {
      const exists = rooms.some((room) => String(room.id) === String(current));

      return exists ? current : rooms[0].id;
    });
  }, [rooms]);

  /*
   * Load messages ONLY for the currently selected room.
   *
   * Important:
   * - We don't fetch when activeRoomId is null.
   * - We don't clear existing messages when a request fails.
   * - requestId prevents an older request from overwriting
   *   a newer room's messages.
   */
  useEffect(() => {
    let cancelled = false;

    const loadRoomMessages = async () => {
      if (!workspace?.id || !activeRoomId) {
        return;
      }

      try {
        setLoadingMessages(true);
        setChatError("");

        const data = await getMessages(workspace.id, activeRoomId);

        if (cancelled) {
          return;
        }

        if (Array.isArray(data)) {
          setMessages((previous) => {
            /*
             * Keep messages from other rooms.
             * Replace only the active room's messages.
             */
            const otherRoomMessages = previous.filter(
              (message) => String(message.roomId) !== String(activeRoomId),
            );

            return [...otherRoomMessages, ...data];
          });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        /*
         * IMPORTANT:
         * Do NOT do setMessages([]) here.
         *
         * If the backend temporarily fails,
         * existing messages should remain visible.
         */
        setChatError(error?.message || "Unable to load messages.");
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    loadRoomMessages();

    return () => {
      cancelled = true;
    };
  }, [workspace?.id, activeRoomId]);

  /*
   * Send a message.
   */
  const sendMessage = async ({ roomId, message }) => {
    if (!workspace?.id) {
      throw new Error("No workspace selected.");
    }

    if (!roomId) {
      throw new Error("No chat room selected.");
    }

    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return;
    }

    const created = await createMessage(workspace.id, roomId, trimmedMessage);

    /*
     * Prevent duplicate messages if the same
     * message already exists in state.
     */
    setMessages((previous) => {
      const alreadyExists = previous.some(
        (item) => String(item.id) === String(created.id),
      );

      if (alreadyExists) {
        return previous;
      }

      return [...previous, created];
    });

    return created;
  };

  /*
   * Create a new chat room.
   */
  const createChatRoom = async (roomName) => {
    if (!workspace?.id) {
      throw new Error("No workspace selected.");
    }

    const name = roomName?.trim();

    if (!name) {
      throw new Error("Room name is required.");
    }

    const room = await createRoom(workspace.id, {
      name,
    });

    /*
     * If UseRoom exposes refreshRooms(),
     * update the room list immediately.
     */
    if (typeof refreshRooms === "function") {
      await refreshRooms();
    }

    /*
     * Select the newly created room if
     * the backend returned its id.
     */
    if (room?.id) {
      setActiveRoomId(room.id);
    }

    return room;
  };

  const activeRoom =
    rooms.find((room) => String(room.id) === String(activeRoomId)) || null;

  const activeRoomMessages = messages.filter(
    (message) => String(message.roomId) === String(activeRoomId),
  );

  const chatRooms = rooms.map((room) => ({
    ...room,

    messages: messages.filter(
      (message) => String(message.roomId) === String(room.id),
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
        loadMessages: async () => {
          if (!workspace?.id || !activeRoomId) {
            return;
          }

          try {
            setLoadingMessages(true);
            setChatError("");

            const data = await getMessages(workspace.id, activeRoomId);

            if (Array.isArray(data)) {
              setMessages((previous) => {
                const otherRoomMessages = previous.filter(
                  (message) => String(message.roomId) !== String(activeRoomId),
                );

                return [...otherRoomMessages, ...data];
              });
            }
          } catch (error) {
            setChatError(error?.message || "Unable to load messages.");
          } finally {
            setLoadingMessages(false);
          }
        },

        createChatRoom,

        loadingMessages,
        chatError,

        user,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
