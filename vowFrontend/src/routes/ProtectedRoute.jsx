import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/UseAuth";

const ProtectedRoute = () => {
  const { user, token } = useAuth();
  const location = useLocation();  //is used to get information about the current URL/page in React Router.

  if (!user && !token) {
    return (
      <Navigate to="/login"
       replace state={{from: location.pathname,}}  /> //remember the url user was trying to visit
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
