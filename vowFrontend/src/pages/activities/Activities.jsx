import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Users,
  X,
} from "lucide-react";

import useActivity from "../../hooks/UseActivity";

const Activities = () => {
  const { activities, deleteActivity, clearActivities } = useActivity();

  const getIcon = (type) => {
    if (type === "task") {
      return <ClipboardList size={18} />;
    }

    if (type === "meeting") {
      return <CalendarDays size={18} />;
    }

    if (type === "chat") {
      return <MessageSquare size={18} />;
    }

    if (type === "member") {
      return <Users size={18} />;
    }

    return <CheckCircle2 size={18} />;
  };

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const difference = Date.now() - new Date(date).getTime();

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-6 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>

            <p className="mt-1 text-sm text-slate-500">
              See what is happening in your workspace.
            </p>
          </div>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={clearActivities}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear activity
            </button>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {activities.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CheckCircle2 size={36} className="mx-auto text-slate-300" />

              <h2 className="mt-4 text-base font-semibold text-slate-800">
                No recent activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Workspace activity will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-5 py-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    {getIcon(activity.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">
                      {activity.user && (
                        <span className="font-semibold">{activity.user}</span>
                      )}

                      {activity.user && " "}

                      <span className="font-medium">{activity.action}</span>

                      {activity.description && (
                        <span> {activity.description}</span>
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatTime(activity.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteActivity(activity.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
