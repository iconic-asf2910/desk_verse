import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/UseAuth";

const ProtectedRoute = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!user && !token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;