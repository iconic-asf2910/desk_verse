const RoomMembers = ({ room }) => {
  return (
    <section>
      <h2>Room Members</h2>
      <p>Members of {room?.name || "this room"} will appear here.</p>
    </section>
  );
};

export default RoomMembers;