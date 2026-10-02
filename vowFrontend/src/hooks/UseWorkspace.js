import { useContext } from "react";
import { WorkspaceContext } from "../contexts/WorkspaceContext";

const useWorkspace = () => {
  return useContext(WorkspaceContext);
};

export default useWorkspace;