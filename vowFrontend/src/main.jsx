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
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { ActivityProvider } from "./contexts/ActivityContext.jsx";
import { ChatProvider } from "./contexts/ChatContext.jsx";
import { PresenceProvider } from "./contexts/PresenceContext.jsx";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <RoomProvider>
            <TaskProvider>
              <PollProvider>
                <NotificationProvider>
                  <ActivityProvider>
                    <ChatProvider>
                      <PresenceProvider>
                        <App />
                      </PresenceProvider>
                    </ChatProvider>
                  </ActivityProvider>
                </NotificationProvider>
              </PollProvider>
            </TaskProvider>
          </RoomProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);