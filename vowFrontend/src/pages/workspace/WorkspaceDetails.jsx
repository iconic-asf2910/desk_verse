import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";
import useRoom from "../../hooks/UseRoom";
import { getWorkspace } from "../../services/api/workspaceApi";
import WorkspaceHeader from "../../components/workspace/WorkspaceHeader";
import RoomList from "../../components/workspace/RoomList";

const WorkspaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    workspace,
    workspaces,
    setWorkspace,
    setWorkspaces,
  } = useWorkspace();

  const { setWorkspaceId } = useRoom();

  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    const existingWorkspace = workspaces.find(
      (item) => String(item.id) === String(id)
    );

    if (existingWorkspace) {
      setWorkspace(existingWorkspace);
      setWorkspaceId(id);
      setLoading(false);
      return;
    }

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setWorkspaceError("");

        const data = await getWorkspace(id);

        setWorkspace(data);

        setWorkspaces((previousWorkspaces) => {
          const alreadyExists = previousWorkspaces.some(
            (item) => String(item.id) === String(data.id)
          );

          if (alreadyExists) {
            return previousWorkspaces;
          }

          return [...previousWorkspaces, data];
        });

        setWorkspaceId(id);
      } catch (error) {
        setWorkspaceError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [
    id,
    workspaces,
    setWorkspace,
    setWorkspaces,
    setWorkspaceId,
  ]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
        <p className="text-sm text-slate-500">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Workspace not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {workspaceError ||
              "The workspace you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-5 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkspaceHeader workspace={workspace} />

          <div className="mt-6">
            <p className="text-xs text-slate-500">
              Workspace ID
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {workspace.id}
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