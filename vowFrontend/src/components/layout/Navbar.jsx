import React from "react";
import useAuth from "../../hooks/UseAuth";

const Navbar = () => {
  const { logout } = useAuth();
  return (
    <div>
      <div>logo</div>
      <div>
        <button>Workspace</button>
      </div>
      <div>
        <button> Notifications</button>
      </div>
      <div>
        <button> Profile</button>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
