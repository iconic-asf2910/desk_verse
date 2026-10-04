import WorkspaceList from "../../components/workspace/WorkspaceList";

const Workspaces = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-slate-900">
          Workspaces
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Select a workspace to view its rooms and details.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkspaceList />
        </div>
      </div>
    </div>
  );
};

export default Workspaces;