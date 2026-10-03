import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { RoomProvider } from "./contexts/RoomContext";
import { TaskProvider } from "./contexts/TaskContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
     <AuthProvider>
  <RoomProvider>
    <TaskProvider>
      <App />
    </TaskProvider>
  </RoomProvider>
</AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
