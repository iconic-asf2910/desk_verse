import { getWorkspaces } from "../services/api/workspaceApi";
import useAuth from "../hooks/UseAuth";
import { createContext, useEffect, useState } from "react";

const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  const loadWorkspaces = async (token) => {
    const data = await getWorkspaces(token);
    setWorkspaces(data);
  };

  useEffect(() => {
  if (token) {
    loadWorkspaces(token);
  }
}, [token]);

  return (
    <WorkspaceContext.Provider
      value={{ workspace, setWorkspace, workspaces, loadWorkspaces }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export { WorkspaceContext, WorkspaceProvider };