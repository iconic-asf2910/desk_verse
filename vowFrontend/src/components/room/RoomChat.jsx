import { useEffect, useState } from "react";
import useWebSocket from "../../hooks/UseWebSocket";
import WS_EVENTS from "../../services/websocket/events";

const RoomChat = () => {
  const { sendMessage, subscribeToMessages } = useWebSocket();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((incomingMessage) => {
      if (incomingMessage.type === WS_EVENTS.CHAT_MESSAGE) {
        setMessages((previousMessages) => [
          ...previousMessages,
          incomingMessage,
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToMessages]);

  const handleSendMessage = (event) => {
    event.preventDefault();

    if (!message.trim()) return;

    sendMessage({
      type: WS_EVENTS.CHAT_MESSAGE,
      content: message,
    });

    setMessage("");
  };

  return (
    <section>
      <h2>Room Chat</h2>

      <div>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((item) => (
            <div key={item.id}>
              <strong>{item.sender}</strong>
              <p>{item.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage}>
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