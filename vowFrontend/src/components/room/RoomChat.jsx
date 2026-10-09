import { useState } from "react";

const RoomChat = ({ room }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

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

  return (
    <section>
      <h2>Room Chat</h2>

      <p>Chat in {room?.name || "this room"}.</p>

      <div>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((item) => (
            <div key={item.id}>
              <p>{item.sender}</p>
              <p>{item.text}</p>
            </div>
          ))
        )}
      </div>

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