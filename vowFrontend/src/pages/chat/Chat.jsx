import { useState } from "react";

const Chat = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>

      <section>
        <h2>Messages</h2>
        <p>No messages yet.</p>
      </section>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;