import { useState } from "react";

const RoomChat = ({ room }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setMessage("");
  };

  return (
    <section>
      <h2>Room Chat</h2>
      <p>Chat in {room?.name || "this room"}.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default RoomChat;