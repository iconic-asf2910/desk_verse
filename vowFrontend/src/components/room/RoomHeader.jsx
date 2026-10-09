const RoomHeader = ({ room }) => {
  return (
    <section>
      <h1>{room?.name || "Room"}</h1>
      <p>Collaborate with your team in this room.</p>
    </section>
  );
};

export default RoomHeader;