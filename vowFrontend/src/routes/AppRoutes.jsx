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
import MeetingDetails from "../pages/meetings/MeetingDetails";
import CreateMeeting from "../pages/meetings/CreateMeeting";
import Meetings from "../pages/meetings/Meetings";
import Rooms from "../pages/room/Rooms";
import Chat from "../pages/chat/Chat";
import Tasks from "../pages/tasks/Tasks";
import Polls from "../pages/polls/Polls";
import Analytics from "../pages/analytics/Analytics";
import JoinMeeting from "../pages/meetings/JoinMeeting";
import Activities from "../pages/activities/Activities";
import Notifications from "../pages/notifications/Notifications";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* <Route element={<ProtectedRoute />}> */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/:id" element={<WorkspaceDetails />} />

        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />

        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/create" element={<CreateMeeting />} />
        <Route path="/meetings/:id" element={<MeetingDetails />} />
        <Route path="/meetings/:id/join" element={<JoinMeeting />} />

        <Route path="/chat" element={<Chat />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/polls" element={<Polls />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      {/* </Route> */}
    </Routes>
  );
};

export default AppRoutes;
