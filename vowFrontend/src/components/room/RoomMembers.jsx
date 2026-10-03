// Who belongs to this room?


const RoomMembers = ({ room }) => {
  return (
    <section>
      <h2>Room Members</h2>

      {!room?.people?.length ? (
        <p>No members in this room.</p>
      ) : (
        room.people.map((person) => (
          <div key={person}>
            <img
              src="/manprofile.png"
              alt={person}
            />

            <div>
              <p>{person}</p>
              <p>Member</p>
            </div>
          </div>
        ))
      )}
    </section>
  );
};

export default RoomMembers;