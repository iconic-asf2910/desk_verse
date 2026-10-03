import { useParams } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";
import WorkspaceHeader from "../../components/workspace/WorkspaceHeader";
import RoomList from "../../components/workspace/RoomList";

const WorkspaceDetails = () => {
  const { id } = useParams();
  const { workspace, workspaces } = useWorkspace();

  const currentWorkspace =
    workspace ||
    workspaces.find((item) => String(item.id) === String(id));

  return (
    <div>
      <WorkspaceHeader workspace={currentWorkspace} />
      <p>Workspace ID: {id}</p>
      <RoomList />
    </div>
  );
};

export default WorkspaceDetails;