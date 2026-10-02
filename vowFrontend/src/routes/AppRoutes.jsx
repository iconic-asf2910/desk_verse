import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Signup from "../pages/auth/Signup";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
