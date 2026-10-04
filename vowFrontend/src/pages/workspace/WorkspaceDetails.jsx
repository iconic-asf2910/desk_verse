import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";
import WorkspaceHeader from "../../components/workspace/WorkspaceHeader";
import RoomList from "../../components/workspace/RoomList";

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    workspace,
    workspaces,
    setWorkspace,
  } = useWorkspace();

  const currentWorkspace = workspaces.find(
    (item) => String(item.id) === String(id)
  );

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspace(currentWorkspace);
    }
  }, [currentWorkspace, setWorkspace]);

  if (!currentWorkspace && !workspace) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
        <button
          type="button"
          onClick={() => navigate("/workspaces")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Workspaces
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Workspace not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The workspace you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const displayedWorkspace = currentWorkspace || workspace;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/workspaces")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Workspaces
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkspaceHeader workspace={displayedWorkspace} />

          <div className="mt-6">
            <p className="text-xs text-slate-500">
              Workspace ID
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {displayedWorkspace.id}
            </p>
          </div>

          <div className="mt-8">
            <RoomList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetails;