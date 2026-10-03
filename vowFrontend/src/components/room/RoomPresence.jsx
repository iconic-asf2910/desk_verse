const RoomPresence = ({ room }) => {
  return (
    <section>
      <h2>People in Room</h2>
      <p>People currently in {room?.name || "this room"} will appear here.</p>
    </section>
  );
};

export default RoomPresence;