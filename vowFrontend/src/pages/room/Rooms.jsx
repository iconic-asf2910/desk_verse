import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";

const Rooms = () => {
  const { rooms } = useRoom();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-5 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          Rooms
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage the rooms in your workspace.
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-lg border border-slate-300 bg-white p-8 text-center">
          <h2 className="text-base font-medium text-slate-800">
            No rooms available
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Rooms created in your workspace will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="rounded-lg border border-slate-300 bg-white p-5 text-left transition hover:border-slate-400 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-medium text-slate-900">
                    {room.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Room {room.id}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                  People in Room
                </p>

                <div className="flex flex-wrap gap-3">
                  {room.people.map((person) => (
                    <div
                      key={person}
                      className="flex items-center gap-2"
                    >
                      <img
                        src="/manprofile.png"
                        alt={person}
                        className="h-8 w-8 rounded-full object-cover"
                      />

                      <span className="text-sm text-slate-700">
                        {person}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <span className="text-sm font-medium text-blue-600">
                  Open Room →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;