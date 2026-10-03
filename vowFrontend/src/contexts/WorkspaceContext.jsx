import { createContext, useState } from "react";

const WorkspaceContext = createContext();

const WorkspaceProvider = ({ children }) => {
  const [workspace, setWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        setWorkspace,
        workspaces,
        setWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export { WorkspaceContext, WorkspaceProvider };