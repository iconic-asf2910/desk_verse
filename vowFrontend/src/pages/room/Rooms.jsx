import useRoom from "../../hooks/UseRoom";
import { useNavigate } from "react-router-dom";

const Rooms = () => {
  const { rooms } = useRoom();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <h1 className="text-2xl font-semibold text-slate-900">
        Rooms
      </h1>

      <div className="mt-6">
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-500">
            No rooms available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-slate-900">
                  {room.name}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {room.people.length}{" "}
                  {room.people.length === 1 ? "person" : "people"} in room
                </p>

                <p className="mt-4 text-sm font-medium text-blue-600">
                  Open Room →
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;