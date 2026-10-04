import { useMemo, useRef, useState } from "react";
import { Paperclip, Search, Send } from "lucide-react";

const initialChats = [
  {
    id: 1,
    name: "Design Team Standup",
    members: 4,
    online: 4,
    avatar: "/boy1.png",
    lastMessage: "Sarah: Ok, the mockups are ready...",
    time: "10:30 AM",
    messages: [
      {
        id: 1,
        sender: "Sarah",
        avatar: "/boy1.png",
        text: "Hi Team, let's sync on the new workspace layout.",
        time: "10:25 AM",
      },
      {
        id: 2,
        sender: "Mike",
        avatar: "/boy2.png",
        text: "Sure, I'll pull up the floor plan.",
        time: "10:26 AM",
      },
      {
        id: 3,
        sender: "Alex",
        avatar: "/boy3.png",
        text: "I have got the analytics ready for review.",
        time: "10:28 AM",
      },
      {
        id: 4,
        sender: "Sarah",
        avatar: "/boy1.png",
        text: "Okay, the mockups are ready for Q4. Let's schedule a quick huddle.",
        time: "10:30 AM",
      },
      {
        id: 5,
        sender: "David",
        avatar: "/boy4.png",
        text: "Okay, Let's do it.",
        time: "10:32 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Mike Rose",
    members: 1,
    online: 1,
    avatar: "/boy2.png",
    lastMessage: "Mike: Thanks for your feedback!",
    time: "10:15 AM",
    messages: [
      {
        id: 1,
        sender: "Mike",
        avatar: "/boy2.png",
        text: "Thanks for your feedback!",
        time: "10:15 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Engineering Hub",
    members: 1,
    online: 1,
    avatar: "/boy4.png",
    lastMessage: "David: New build deployed.",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "David",
        avatar: "/boy4.png",
        text: "New build deployed.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: 4,
    name: "Chloe Wang",
    members: 1,
    online: 1,
    avatar: "/boy5.png",
    lastMessage: "Chloe: See you in the Lounge.",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        sender: "Chloe",
        avatar: "/boy5.png",
        text: "See you in the Lounge.",
        time: "Yesterday",
      },
    ],
  },
];

const Chat = () => {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(1);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [chats, search]);

  const sendMessage = () => {
    const text = message.trim();

    if (!text || !activeChat) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      avatar: "/manprofile.png",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setChats((previousChats) =>
      previousChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: `You: ${text}`,
              time: newMessage.time,
            }
          : chat
      )
    );

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage((previous) =>
      previous
        ? `${previous} [${file.name}]`
        : `[${file.name}]`
    );

    event.target.value = "";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[520px] overflow-hidden bg-white">
      <aside className="flex w-[37%] min-w-[280px] max-w-[430px] flex-col border-r border-slate-300 bg-slate-50">
        <div className="mx-3 mt-3 flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-slate-500">
          <Search size={16} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setActiveChatId(chat.id)}
                className={`flex min-h-[76px] w-full items-center gap-2.5 border-b border-slate-200 px-3 py-2.5 text-left transition ${
                  chat.id === activeChatId
                    ? "bg-gradient-to-r from-indigo-50 to-white"
                    : "bg-transparent hover:bg-slate-100"
                }`}
              >
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-slate-800">
                      {chat.name}
                    </span>

                    <time className="shrink-0 text-[10px] text-slate-500">
                      {chat.time}
                    </time>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-slate-500">
                      {chat.lastMessage}
                    </span>

                    {chat.members > 1 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-[9px] text-indigo-600">
                        {chat.members}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        {activeChat && (
          <>
            <header className="flex h-[62px] items-center gap-2.5 border-b border-slate-300 bg-white px-4">
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="h-[34px] w-[34px] rounded-full object-cover"
              />

              <div>
                <h1 className="text-sm font-semibold text-slate-800">
                  {activeChat.name}
                </h1>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {activeChat.online}{" "}
                  {activeChat.online === 1 ? "member" : "members"} online
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
              {activeChat.messages.map((item) => (
                <div
                  key={item.id}
                  className="mb-3 flex items-start gap-2"
                >
                  <img
                    src={item.avatar}
                    alt={item.sender}
                    className="h-[27px] w-[27px] shrink-0 rounded-full object-cover"
                  />

                  <div className="max-w-[75%]">
                    <div className="mb-1 flex items-center gap-2">
                      <strong className="text-[11px] font-semibold text-slate-700">
                        {item.sender}
                      </strong>

                      <time className="text-[9px] text-slate-400">
                        {item.time}
                      </time>
                    </div>

                    <div className="w-fit max-w-full rounded-md border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 px-2.5 py-1.5 text-[11px] leading-[1.35] text-slate-700 shadow-sm">
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative border-t border-slate-300 bg-white px-3 py-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows="1"
                className="min-h-7 w-full resize-none border-none bg-transparent px-1 py-1 pr-20 text-[11px] leading-[18px] text-slate-700 outline-none placeholder:text-slate-400"
              />

              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <Paperclip size={17} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  title="Send"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-default disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Chat;