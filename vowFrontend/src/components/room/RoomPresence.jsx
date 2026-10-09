// Who is currently inside?


const RoomPresence = ({ room }) => {
  return (
    <section>
      <h2>People in Room</h2>

      {!room?.people?.length ? (
        <p>No one is currently in this room.</p>
      ) : (
        room.people.map((person) => (
          <div key={person}>
            <img
              src="/manprofile.png"
              alt={person}
            />

            <div>
              <p>{person}</p>
              <p>Online</p>
            </div>
          </div>
        ))
      )}
    </section>
  );
};

export default RoomPresence;