import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "/dashboard.png",
    },
    {
      name: "Rooms",
      path: "/rooms",
      icon: "/rooms.png",
    },
    {
      name: "Meetings",
      path: "/meetings",
      icon: "/meetings.png",
    },
    {
      name: "Chat",
      path: "/chat",
      icon: "/chat.png",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: "/tasks.png",
    },
    {
      name: "Polls",
      path: "/polls",
      icon: "/polls.png",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "/analytics.png",
    },
    {
      name: "Activity",
      path: "/activities",
      icon: "/activity.png",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "/profile.png",
    },
  ];

  return (
    <aside className="min-h-[calc(100vh-4rem)] w-55 shrink-0 bg-[#111827] px-3 py-5">
      <nav className="space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <img src={link.icon} alt="" className="h-8 w-8 object-contain" />

            <span className="text-sm font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
