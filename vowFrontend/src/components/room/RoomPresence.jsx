import { useEffect, useState } from "react";
import useWebSocket from "../../hooks/UseWebSocket";
import WS_EVENTS from "../../services/websocket/events";

const RoomPresence = () => {
  const { subscribeToMessages } = useWebSocket();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === WS_EVENTS.PRESENCE_UPDATE) {
        setUsers(message.users || []);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToMessages]);

  return (
    <section>
      <h2>People in Room</h2>

      {users.length === 0 ? (
        <p>No users currently visible.</p>
      ) : (
        users.map((user) => (
          <div key={user.id}>
            {user.name}
          </div>
        ))
      )}
    </section>
  );
};

export default RoomPresence;