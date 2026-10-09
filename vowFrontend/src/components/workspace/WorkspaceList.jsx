import { useNavigate } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";

const WorkspaceList = () => {
  const { workspaces, setWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleWorkspaceClick = (workspace) => {
    setWorkspace(workspace);
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <section>
      <h2>Workspaces</h2>

      {workspaces.length === 0 ? (
        <p>No workspaces available.</p>
      ) : (
        workspaces.map((workspace) => (
          <button
            key={workspace.id}
            type="button"
            onClick={() => handleWorkspaceClick(workspace)}
          >
            {workspace.name}
          </button>
        ))
      )}
    </section>
  );
};

export default WorkspaceList;