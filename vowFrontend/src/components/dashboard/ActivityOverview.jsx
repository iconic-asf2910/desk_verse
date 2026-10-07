import useActivity from "../../hooks/UseActivity";

const ActivityOverview = () => {
  const { activities } = useActivity();

  const recentActivities = activities.slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity.</p>
        ) : (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="text-sm font-medium text-slate-800">
                {activity.action}
              </p>

              {activity.description && (
                <p className="mt-1 text-xs text-slate-500">
                  {activity.description}
                </p>
              )}

              <p className="mt-2 text-[11px] text-slate-400">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ActivityOverview;
