const RoomActivity = ({ rooms }) => {
  if (rooms.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-medium text-slate-800">
          Room Activity
        </h2>

        <p className="mt-6 text-sm text-slate-400">
          No room data available.
        </p>
      </section>
    );
  }

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-orange-500",
    "bg-pink-500",
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-medium text-slate-800">
        Room Activity
      </h2>

      <div className="mt-6 space-y-5">
        {rooms.map((room, index) => {
          const memberCount = room.members?.length || 0;
          const percentage = Math.min(memberCount * 20, 100);

          return (
            <div key={room.id}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  {room.name}
                </p>

                <p className="text-xs text-slate-500">
                  {memberCount}{" "}
                  {memberCount === 1 ? "member" : "members"}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    colors[index % colors.length]
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoomActivity;