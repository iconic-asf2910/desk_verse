import useWorkspace from "../../hooks/UseWorkspace";
import { useNavigate } from "react-router-dom";

const WorkspaceList = () => {
  const { workspaces, setWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSelect = (workspace) => {
    setWorkspace(workspace);
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <div>
      {workspaces.map((workspace) => (
        <div
          key={workspace.id}
          onClick={() => handleSelect(workspace)}
        >
          {workspace.name}
        </div>
      ))}
    </div>
  );
};

export default WorkspaceList;