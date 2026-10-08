import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useWorkspace from "../../hooks/UseWorkspace";

const Workspaces = () => {
  const navigate = useNavigate();

  const {
    workspaces,
    selectWorkspace,
    addWorkspace,
    loadingWorkspaces,
    creatingWorkspace,
    workspaceError,
  } = useWorkspace();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setError("");

      const newWorkspace = await addWorkspace({
        name,
        description,
      });

      setName("");
      setDescription("");
      setShowModal(false);

      navigate(`/workspaces/${newWorkspace.id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleWorkspaceClick = (workspace) => {
    selectWorkspace(workspace.id);
    navigate(`/workspaces/${workspace.id}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Workspaces
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage your workspaces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Create Workspace
          </button>
        </div>

        {workspaceError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {workspaceError}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loadingWorkspaces ? (
            <p className="text-sm text-slate-500">Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="text-base font-medium text-slate-800">
                No workspaces yet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create your first workspace to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-5 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Workspace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => handleWorkspaceClick(workspace)}
                  className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-400 hover:shadow-sm"
                >
                  <h2 className="text-base font-semibold text-slate-900">
                    {workspace.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {workspace.description || "No description provided."}
                  </p>

                  <div className="mt-4 text-xs font-medium text-slate-400">
                    Open workspace →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Workspace
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  A Main Room will be created automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {(error || workspaceError) && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error || workspaceError}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Workspace Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Development Team"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe your workspace"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingWorkspace}
                  className="rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingWorkspace ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspaces;
