import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Workspaces", path: "/workspaces" },
    { name: "Rooms", path: "/rooms" },
    { name: "Meetings", path: "/meetings" },
    { name: "Chat", path: "/chat" },
    { name: "Tasks", path: "/tasks" },
    { name: "Polls", path: "/polls" },
    { name: "Analytics", path: "/analytics" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="flex flex-col gap-2 p-4">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `w-fit p-2 rounded ${
              isActive ? "bg-green-500 text-white" : "text-gray-600"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );
};

export default Sidebar;