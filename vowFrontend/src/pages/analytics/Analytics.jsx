import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useRoom from "../../hooks/UseRoom";
import useTask from "../../hooks/UseTask";
import useWorkspace from "../../hooks/UseWorkspace";
import { getMeetings } from "../../services/api/meetingApi";

const Analytics = () => {
  const navigate = useNavigate();

  const { rooms } = useRoom();
  const { tasks } = useTask();
  const { workspace } = useWorkspace();

  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] =
    useState(false);

  const [meetingError, setMeetingError] =
    useState("");

  useEffect(() => {
    const loadMeetings = async () => {
      if (!workspace?.id) {
        setMeetings([]);
        return;
      }

      try {
        setLoadingMeetings(true);
        setMeetingError("");

        const data = await getMeetings(workspace.id);

        setMeetings(data);
      } catch (error) {
        setMeetingError(error.message);
      } finally {
        setLoadingMeetings(false);
      }
    };

    loadMeetings();
  }, [workspace?.id]);

  const analytics = useMemo(() => {
    const totalRooms = rooms.length;

    const totalMembers = rooms.reduce(
      (total, room) =>
        total + (room.members?.length || 0),
      0
    );

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "Done"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "In Progress"
    ).length;

    const todoTasks = tasks.filter(
      (task) => task.status === "To Do"
    ).length;

    const taskCompletion =
      totalTasks > 0
        ? Math.round(
            (completedTasks / totalTasks) * 100
          )
        : 0;

    const upcomingMeetings = meetings.filter(
      (meeting) =>
        meeting.startTime &&
        new Date(meeting.startTime) > new Date()
    ).length;

    const completedMeetings = meetings.filter(
      (meeting) =>
        meeting.status === "completed"
    ).length;

    const cancelledMeetings = meetings.filter(
      (meeting) =>
        meeting.status === "cancelled"
    ).length;

    return {
      totalRooms,
      totalMembers,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      taskCompletion,
      totalMeetings: meetings.length,
      upcomingMeetings,
      completedMeetings,
      cancelledMeetings,
    };
  }, [rooms, tasks, meetings]);

  const formatRoomStatus = (room) => {
    return room.members?.length > 0
      ? "Active"
      : "Empty";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              A quick overview of your workspace activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rooms
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {analytics.totalRooms}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Workspace rooms
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Members
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {analytics.totalMembers}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Across all rooms
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Tasks
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {analytics.totalTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {analytics.taskCompletion}% completed
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Meetings
            </p>

            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {loadingMeetings
                ? "..."
                : analytics.totalMeetings}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {loadingMeetings
                ? "Loading..."
                : `${analytics.upcomingMeetings} upcoming`}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Task Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current workspace task status.
                </p>
              </div>

              <span className="text-xl font-semibold text-emerald-600">
                {analytics.taskCompletion}%
              </span>
            </div>

            <div className="mt-5">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${analytics.taskCompletion}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  To Do
                </p>

                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {analytics.todoTasks}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  In Progress
                </p>

                <p className="mt-1 text-xl font-semibold text-amber-500">
                  {analytics.inProgressTasks}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">
                  Done
                </p>

                <p className="mt-1 text-xl font-semibold text-emerald-600">
                  {analytics.completedTasks}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Meetings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Workspace meeting summary.
              </p>
            </div>

            {meetingError ? (
              <p className="mt-6 text-sm text-red-500">
                {meetingError}
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Upcoming
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-purple-600">
                    {loadingMeetings
                      ? "..."
                      : analytics.upcomingMeetings}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-emerald-600">
                    {loadingMeetings
                      ? "..."
                      : analytics.completedMeetings}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Cancelled
                  </p>

                  <p className="mt-1 text-2xl font-semibold text-red-500">
                    {loadingMeetings
                      ? "..."
                      : analytics.cancelledMeetings}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Room Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current room occupancy across the workspace.
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-500">
                No rooms available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rooms.map((room) => {
                const memberCount =
                  room.members?.length || 0;

                const active =
                  memberCount > 0;

                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {room.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {memberCount}{" "}
                        {memberCount === 1
                          ? "member"
                          : "members"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          active
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {formatRoomStatus(room)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Analytics;