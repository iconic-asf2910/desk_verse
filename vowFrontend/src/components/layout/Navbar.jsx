import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <div>
      <Link to="/">logo</Link>

      <div>
        <Link to="/workspaces">Workspace</Link>
      </div>

      <div>
        <button>Notifications</button>
      </div>

      <div>
        <Link to="/profile">Profile</Link>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;