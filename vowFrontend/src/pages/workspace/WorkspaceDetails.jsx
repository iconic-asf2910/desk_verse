import { useParams } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";

const WorkspaceDetails = () => {
  const { id } = useParams();
  const { workspace } = useWorkspace();

  return (
    <div>
      <h1>{workspace?.name}</h1>
      <p>Workspace ID: {id}</p>
    </div>
  );
};

export default WorkspaceDetails;
