const RoomMeeting = ({ room }) => {
  return (
    <section>
      <h2>Meeting</h2>
      <p>Start or join a meeting in {room?.name || "this room"}.</p>

      <button type="button">Join Meeting</button>
    </section>
  );
};

export default RoomMeeting;