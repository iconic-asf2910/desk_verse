import { createContext, useEffect, useState } from "react";

import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "../services/api/workspaceApi";

const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  const loadWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      setWorkspaceError("");

      const data = await getWorkspaces();

      const list = Array.isArray(data) ? data : [];

      setWorkspaces(list);

      const savedId = localStorage.getItem("deskverseWorkspaceId");

      const selected =
        list.find((item) => String(item.id) === String(savedId)) ||
        list[0] ||
        null;  //Previously selected workspace ,if not found ,First workspace ,if none ,null

      setWorkspace(selected);

      if (selected) {
        localStorage.setItem("deskverseWorkspaceId", selected.id);
      }
    } catch (error) {
      setWorkspaceError(error.message);
      setWorkspaces([]);
      setWorkspace(null);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const selectWorkspace = (workspaceId) => {
    const selected = workspaces.find(
      (item) => String(item.id) === String(workspaceId),
    );

    if (!selected) {
      return;
    }

    setWorkspace(selected);

    localStorage.setItem("deskverseWorkspaceId", selected.id);
  };

  const addWorkspace = async (workspaceData) => {
    const created = await createWorkspace({
      name: workspaceData.name.trim(),
      description: workspaceData.description || "",
    }); //Sends workspace data to the backend.

    setWorkspaces((previous) => [...previous, created]);

    setWorkspace(created);

    localStorage.setItem("deskverseWorkspaceId", created.id);

    return created;
  };

  const editWorkspace = async (workspaceId, data) => {
    const updated = await updateWorkspace(workspaceId, data);

    setWorkspaces((previous) =>
      previous.map((item) => (item.id === workspaceId ? updated : item)),
    );

    setWorkspace((current) =>
      current?.id === workspaceId ? updated : current,
    );

    return updated;
  };

  const removeWorkspace = async (workspaceId) => {
    await deleteWorkspace(workspaceId);

    const remaining = workspaces.filter((item) => item.id !== workspaceId);

    setWorkspaces(remaining);

    if (workspace?.id === workspaceId) {
      const next = remaining[0] || null;

      setWorkspace(next);

      if (next) {
        localStorage.setItem("deskverseWorkspaceId", next.id);
      } else {
        localStorage.removeItem("deskverseWorkspaceId");
      }
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
        updateWorkspace: editWorkspace,
        deleteWorkspace: removeWorkspace,
        loadWorkspaces,
        loadingWorkspaces,
        workspaceError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export { WorkspaceContext, WorkspaceProvider };
