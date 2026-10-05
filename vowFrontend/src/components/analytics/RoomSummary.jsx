const RoomSummary = ({ rooms }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-medium text-slate-800">
        Room Summary
      </h2>

      {rooms.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          No rooms available.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-3 text-xs font-medium text-slate-500">
                  Room
                </th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500">
                  Type
                </th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500">
                  Members
                </th>
                <th className="px-3 py-3 text-xs font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => {
                const memberCount = room.members?.length || 0;

                return (
                  <tr
                    key={room.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-3 text-sm font-medium text-slate-800">
                      {room.name}
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-500">
                      {room.type || "General"}
                    </td>

                    <td className="px-3 py-3 text-sm text-slate-500">
                      {memberCount}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          memberCount > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {memberCount > 0 ? "Active" : "Empty"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RoomSummary;