import { useNavigate } from "react-router-dom";
import workspaces from "../../data/workspaces";

const WorkspaceOverview = () => {
  const navigate = useNavigate();

  const handleWorkspaceClick = (workspace) => {
    navigate(`/workspaces/${workspace.id}`);
  };

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