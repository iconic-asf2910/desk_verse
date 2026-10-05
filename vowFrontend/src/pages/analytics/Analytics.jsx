import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";
import StatCard from "../../components/analytics/StatCard";
import RoomActivity from "../../components/analytics/RoomActivity";
import WorkspaceOverview from "../../components/analytics/WorkspaceOverview";
import RoomSummary from "../../components/analytics/RoomSummary";

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
          <StatCard
            title="Total Rooms"
            value={analytics.totalRooms}
            subtitle="Workspace rooms"
          />

          <StatCard
            title="Total Members"
            value={analytics.totalMembers}
            subtitle="Across all rooms"
          />

          <StatCard
            title="Active Rooms"
            value={analytics.activeRooms}
            subtitle="Rooms with members"
            valueClass="text-emerald-600"
          />

          <StatCard
            title="Avg. Members / Room"
            value={analytics.averageMembers}
            subtitle="Average room size"
            valueClass="text-blue-600"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RoomActivity rooms={rooms} />

          <WorkspaceOverview
            totalRooms={analytics.totalRooms}
            totalMembers={analytics.totalMembers}
            activeRooms={analytics.activeRooms}
            averageMembers={analytics.averageMembers}
          />
        </div>

        <div className="mt-5">
          <RoomSummary rooms={rooms} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;