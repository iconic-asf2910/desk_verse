import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { RoomProvider } from "./contexts/RoomContext";
import { TaskProvider } from "./contexts/TaskContext";
import { PollProvider } from "./contexts/PollContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ActivityProvider } from "./contexts/ActivityContext";
import { ChatProvider } from "./contexts/ChatContext";
import { PresenceProvider } from "./contexts/PresenceContext";

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