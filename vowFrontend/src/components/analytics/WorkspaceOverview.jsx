const WorkspaceOverview = ({
  totalRooms,
  totalMembers,
  activeRooms,
  averageMembers,
}) => {
  const items = [
    {
      label: "Rooms created",
      value: totalRooms,
      className: "text-slate-800",
    },
    {
      label: "Members across rooms",
      value: totalMembers,
      className: "text-slate-800",
    },
    {
      label: "Rooms with members",
      value: activeRooms,
      className: "text-emerald-600",
    },
    {
      label: "Average room size",
      value: averageMembers,
      className: "text-blue-600",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-medium text-slate-800">
        Workspace Overview
      </h2>

      <div className="mt-6 space-y-5">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center justify-between ${
              index !== items.length - 1
                ? "border-b border-slate-100 pb-4"
                : ""
            }`}
          >
            <span className="text-sm text-slate-500">
              {item.label}
            </span>

            <span
              className={`text-sm font-medium ${item.className}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkspaceOverview;