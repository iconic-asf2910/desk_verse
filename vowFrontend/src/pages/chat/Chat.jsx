import { useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
} from "lucide-react";
import useAuth from "../../hooks/UseAuth";
import useChat from "../../hooks/UseChat";

const Chat = () => {
  const { user } = useAuth();

  const {
    rooms,
    activeRoom,
    activeRoomId,
    setActiveRoomId,
    sendMessage,
    createChatRoom,
  } = useChat();

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roomName, setRoomName] =
    useState("");

  const [
    showCreateRoom,
    setShowCreateRoom,
  ] = useState(false);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const getMessageText = (item) => {
    return (
      item.content ||
      item.message ||
      ""
    );
  };

  const getSenderId = (item) => {
    return item.senderId || "";
  };

  const isOwnMessage = (item) => {
    return (
      String(getSenderId(item)) ===
      String(user?.id)
    );
  };

  const getSenderName = (item) => {
    if (isOwnMessage(item)) {
      return user?.name || "You";
    }

    return item.senderName ||
      item.sender ||
      "User";
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (
      !message.trim() ||
      !activeRoom
    ) {
      return;
    }

    try {
      await sendMessage({
        roomId: activeRoom.id,
        message,
      });

      setMessage("");
    } catch {
      return;
    }
  };

  const handleCreateRoom = async (
    event
  ) => {
    event.preventDefault();

    if (!roomName.trim()) {
      return;
    }

    try {
      await createChatRoom(
        roomName.trim()
      );

      setRoomName("");
      setShowCreateRoom(false);
    } catch {
      return;
    }
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] p-4">
      <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-300 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Chat
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                Workspace conversations
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateRoom(true)
              }
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-purple-600"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="border-b border-slate-200 px-3 py-3">
            <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
              <Search
                size={15}
                className="text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search"
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map(
              (room, index) => {
                const lastMessage =
                  room.messages?.[
                    room.messages.length -
                      1
                  ];

                const active =
                  activeRoomId === room.id;

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() =>
                      setActiveRoomId(
                        room.id
                      )
                    }
                    className={`flex w-full items-center gap-3 border-b border-slate-200 px-3 py-3 text-left transition ${
                      active
                        ? "bg-purple-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        active
                          ? "bg-purple-200 text-purple-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <MessageCircle
                        size={19}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {index + 1}.{" "}
                          {room.name}
                        </p>

                        {lastMessage && (
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatTime(
                              lastMessage.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {lastMessage
                          ? `${getSenderName(
                              lastMessage
                            )}: ${getMessageText(
                              lastMessage
                            )}`
                          : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-300 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <MessageCircle size={20} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {activeRoom?.name ||
                    "Chat"}
                </h2>

                <p className="text-xs text-slate-400">
                  {activeRoom
                    ? `${
                        activeRoom
                          .messages
                          ?.length || 0
                      } messages`
                    : "Workspace conversation"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <MoreVertical
                size={18}
              />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#fafafa] px-5 py-5">
            {!activeRoom ||
            !activeRoom.messages?.length ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <MessageCircle
                    size={25}
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No messages yet
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Start the conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {activeRoom.messages.map(
                  (item) => {
                    const ownMessage =
                      isOwnMessage(
                        item
                      );

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 ${
                          ownMessage
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!ownMessage && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                            {getSenderName(
                              item
                            )
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>
                        )}

                        <div
                          className={`max-w-[65%] ${
                            ownMessage
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {getSenderName(
                                item
                              )}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {formatTime(
                                item.createdAt
                              )}
                            </span>
                          </div>

                          <div
                            className={`rounded-xl px-4 py-2.5 text-sm ${
                              ownMessage
                                ? "bg-purple-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                            }`}
                          >
                            {getMessageText(
                              item
                            )}
                          </div>
                        </div>

                        {ownMessage && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                            {getSenderName(
                              item
                            )
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-slate-300 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Type a message..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Smile size={17} />
              </button>

              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Paperclip
                  size={17}
                />
              </button>

              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full text-purple-600 hover:bg-purple-50"
              >
                <Send size={17} />
              </button>
            </div>
          </form>
        </section>
      </div>

      {showCreateRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Chat
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a new conversation.
            </p>

            <form
              onSubmit={handleCreateRoom}
              className="mt-5"
            >
              <input
                type="text"
                value={roomName}
                onChange={(event) =>
                  setRoomName(
                    event.target.value
                  )
                }
                placeholder="Chat name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500"
              />

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoom(
                      false
                    );
                    setRoomName("");
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;