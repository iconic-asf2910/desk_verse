import { useParams } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";
import WorkspaceHeader from "../../components/workspace/WorkspaceHeader";
import RoomList from "../../components/workspace/RoomList";

const WorkspaceDetails = () => {
  const { id } = useParams();
  const { workspace } = useWorkspace();

  return (
    <div>
      <WorkspaceHeader />

      <p>Workspace ID: {id}</p>

      <RoomList />
    </div>
  );
};

export default WorkspaceDetails;