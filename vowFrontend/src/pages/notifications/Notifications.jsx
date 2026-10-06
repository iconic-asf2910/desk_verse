import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import useNotification from "../../hooks/UseNotification";

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotification();

  const formatTime = (date) => {
    const difference =
      Date.now() - new Date(date).getTime();

    const minutes = Math.floor(
      difference / 60000
    );

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with workspace activity.
            </p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Bell
                size={36}
                className="text-slate-300"
              />

              <h2 className="mt-4 text-base font-semibold text-slate-800">
                No notifications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                You're all caught up.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 px-5 py-5 ${
                    notification.read
                      ? "bg-white"
                      : "bg-purple-50/40"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Bell size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-400">
                          {formatTime(
                            notification.createdAt
                          )}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                            title="Mark as read"
                          >
                            <Check size={17} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {!notification.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;