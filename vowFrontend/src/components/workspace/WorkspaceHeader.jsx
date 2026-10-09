const WorkspaceHeader = ({ workspace }) => {
  return (
    <section>
      <h1>{workspace?.name || "Workspace"}</h1>
      <p>{workspace?.description || "Manage your workspace and rooms."}</p>
    </section>
  );
};

export default WorkspaceHeader;