import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";
import { getRoom } from "../../services/api/roomApi";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { rooms, setRoom } = useRoom();

  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const existingRoom = rooms.find(
      (room) => String(room.id) === String(id)
    );

    if (existingRoom) {
      setCurrentRoom(existingRoom);
      setRoom(existingRoom);
      setLoading(false);
      return;
    }

    const loadRoom = async () => {
      try {
        setLoading(true);
        setRoomError("");

        const data = await getRoom(id);

        setCurrentRoom(data);
        setRoom(data);
      } catch (error) {
        setCurrentRoom(null);
        setRoomError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [id, rooms, setRoom]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: Date.now(),
        text: message.trim(),
        sender: "You",
      },
    ]);

    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-5">
        <p className="text-sm text-slate-500">
          Loading room...
        </p>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-5">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-lg border border-slate-300 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Room not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {roomError ||
              "The room you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const members = currentRoom.members || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-5">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-5 text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {currentRoom.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {currentRoom.description ||
              "Collaborate with your team in this room."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/meetings")}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Join Meeting
        </button>
      </div>

      <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5">
        <div className="rounded-lg border border-slate-300 bg-white p-5">
          <h2 className="mb-4 text-base font-medium text-slate-800">
            People in Room
          </h2>

          <div className="space-y-4">
            {members.length === 0 ? (
              <p className="text-sm text-slate-400">
                No members in this room.
              </p>
            ) : (
              members.map((person, index) => (
                <div
                  key={`${person}-${index}`}
                  className="flex items-center gap-3"
                >
                  <img
                    src="/manprofile.png"
                    alt={person}
                    className="h-9 w-9 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {person}
                    </p>

                    <p className="text-xs text-emerald-600">
                      Online
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-medium text-slate-800">
              Room Chat
            </h2>
          </div>

          <div className="min-h-[360px] p-5">
            {messages.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-slate-400">
                  No messages yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md bg-slate-100 px-4 py-3"
                  >
                    <p className="text-xs font-medium text-slate-500">
                      {item.sender}
                    </p>

                    <p className="mt-1 text-sm text-slate-800">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-3 border-t border-slate-200 p-4"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;