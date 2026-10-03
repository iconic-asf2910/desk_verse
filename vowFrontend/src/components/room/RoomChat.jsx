const RoomChat = () => {
  return (
    <section>
      <h2>Room Chat</h2>
      <p>Chat messages will appear here.</p>

      <form>
        <input
          type="text"
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default RoomChat;