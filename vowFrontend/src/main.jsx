import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { RoomProvider } from "./contexts/RoomContext";
import { TaskProvider } from "./contexts/TaskContext";
import { PollProvider } from "./contexts/PollContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <RoomProvider>
          <TaskProvider>
  <PollProvider>
    <App />
  </PollProvider>
</TaskProvider>
          </RoomProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);