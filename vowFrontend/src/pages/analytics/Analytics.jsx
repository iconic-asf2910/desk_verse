import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";

const Analytics = () => {
  const navigate = useNavigate();
  const { rooms } = useRoom();

  const analytics = useMemo(() => {
    const totalRooms = rooms.length;

    const totalMembers = rooms.reduce(
      (total, room) => total + (room.members?.length || 0),
      0
    );

    const activeRooms = rooms.filter(
      (room) => (room.members?.length || 0) > 0
    ).length;

    const averageMembers =
      totalRooms > 0
        ? (totalMembers / totalRooms).toFixed(1)
        : "0.0";

    return {
      totalRooms,
      totalMembers,
      activeRooms,
      averageMembers,
    };
  }, [rooms]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-8 py-7">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your workspace activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Rooms</p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {analytics.totalRooms}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Members</p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {analytics.totalMembers}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active Rooms</p>

            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {analytics.activeRooms}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Avg. Members / Room</p>

            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {analytics.averageMembers}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-slate-800">
              Room Activity
            </h2>

            <div className="mt-6 space-y-5">
              {rooms.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No room data available.
                </p>
              ) : (
                rooms.map((room) => {
                  const memberCount = room.members?.length || 0;

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
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              memberCount * 20,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-medium text-slate-800">
              Workspace Overview
            </h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Rooms created
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {analytics.totalRooms}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Members across rooms
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {analytics.totalMembers}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Rooms with members
                </span>

                <span className="text-sm font-medium text-emerald-600">
                  {analytics.activeRooms}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Average room size
                </span>

                <span className="text-sm font-medium text-blue-600">
                  {analytics.averageMembers}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-slate-800">
            Room Summary
          </h2>

          <div className="mt-4 overflow-x-auto">
            {rooms.length === 0 ? (
              <p className="text-sm text-slate-400">
                No rooms available.
              </p>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;