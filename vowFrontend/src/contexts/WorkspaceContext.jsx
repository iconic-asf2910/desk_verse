import { createContext, useEffect, useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
} from "../services/api/workspaceApi";
import { createRoom } from "../services/api/roomApi";

const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceError, setWorkspaceError] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        setWorkspaceError("");

        const data = await getWorkspaces();
        const workspaceList = Array.isArray(data) ? data : [];

        setWorkspaces(workspaceList);

        const savedWorkspaceId =
          localStorage.getItem("deskverseWorkspaceId");

        const savedWorkspace = workspaceList.find(
          (item) =>
            String(item.id) === String(savedWorkspaceId)
        );

        const selectedWorkspace =
          savedWorkspace || workspaceList[0] || null;

        setWorkspace(selectedWorkspace);

        if (selectedWorkspace) {
          localStorage.setItem(
            "deskverseWorkspaceId",
            selectedWorkspace.id
          );
        }
      } catch (error) {
        setWorkspaceError(error.message);
        setWorkspaces([]);
        setWorkspace(null);
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    loadWorkspaces();
  }, []);

  const selectWorkspace = (workspaceId) => {
    const selectedWorkspace = workspaces.find(
      (item) =>
        String(item.id) === String(workspaceId)
    );

    if (!selectedWorkspace) {
      return;
    }

    setWorkspace(selectedWorkspace);

    localStorage.setItem(
      "deskverseWorkspaceId",
      selectedWorkspace.id
    );
  };

  const addWorkspace = async (workspaceData) => {
    try {
      setCreatingWorkspace(true);
      setWorkspaceError("");

      const newWorkspace = await createWorkspace({
        name: workspaceData.name.trim(),
        description: workspaceData.description.trim(),
      });

      let workspaceWithRoom = newWorkspace;

      try {
        await createRoom(newWorkspace.id, {
          name: "Main Room",
          description: "Default workspace meeting room",
          type: "general",
        });
      } catch (roomError) {
        throw new Error(
          `Workspace was created, but the default room could not be created: ${roomError.message}`
        );
      }

      setWorkspaces((previousWorkspaces) => [
        ...previousWorkspaces,
        workspaceWithRoom,
      ]);

      setWorkspace(workspaceWithRoom);

      localStorage.setItem(
        "deskverseWorkspaceId",
        workspaceWithRoom.id
      );

      return workspaceWithRoom;
    } catch (error) {
      setWorkspaceError(error.message);
      throw error;
    } finally {
      setCreatingWorkspace(false);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        workspaces,
        setWorkspaces,
        selectWorkspace,
        addWorkspace,
        workspaceError,
        loadingWorkspaces,
        creatingWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export {
  WorkspaceContext,
  WorkspaceProvider,
};