import { createContext, useEffect, useState } from "react";
import { getWorkspaces } from "../services/api/workspaceApi";

const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceError, setWorkspaceError] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        setWorkspaceError("");

        const data = await getWorkspaces();

        setWorkspaces(data);

        const savedWorkspaceId =
          localStorage.getItem("deskverseWorkspaceId");

        const savedWorkspace = data.find(
          (item) => String(item.id) === String(savedWorkspaceId)
        );

        const selectedWorkspace = savedWorkspace || data[0] || null;

        setWorkspace(selectedWorkspace);

        if (selectedWorkspace) {
          localStorage.setItem(
            "deskverseWorkspaceId",
            selectedWorkspace.id
          );
        }
      } catch (error) {
        setWorkspaceError(error.message);
      } finally {
        setLoadingWorkspaces(false);
      }
    };

    loadWorkspaces();
  }, []);

  const selectWorkspace = (workspaceId) => {
    const selectedWorkspace = workspaces.find(
      (item) => String(item.id) === String(workspaceId)
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

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        workspaces,
        setWorkspaces,
        selectWorkspace,
        workspaceError,
        loadingWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export { WorkspaceContext, WorkspaceProvider };