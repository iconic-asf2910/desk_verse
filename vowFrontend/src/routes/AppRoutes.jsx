import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Workspaces from "../pages/workspace/Workspaces";
import WorkspaceDetails from "../pages/workspace/WorkspaceDetails";
import RoomDetails from "../pages/room/RoomDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
        <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetails />} />

          {/* 
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/analytics" element={<Analytics />} />
          */}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
