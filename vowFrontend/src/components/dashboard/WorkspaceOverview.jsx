import { useNavigate } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";

const WorkspaceOverview = () => {
  const { workspaces, loadingWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  const handleWorkspaceClick = (workspace) => {
    navigate(`/workspaces/${workspace.id}`);
  };

  if (loadingWorkspaces) {
    return <p>Loading workspaces...</p>;
  }

  return (
    <section>
      <h2>Your Workspaces</h2>

      {workspaces.map((workspace) => (
        <div
          key={workspace.id}
          onClick={() => handleWorkspaceClick(workspace)}
        >
          <h3>{workspace.name}</h3>
          <p>{workspace.description}</p>
        </div>
      ))}
    </section>
  );
};

export default WorkspaceOverview;