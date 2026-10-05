import useTask from "../../hooks/UseTask";

const TaskOverview = () => {
  const { tasks } = useTask();

  return (
    <section>
      <h2>Tasks</h2>

      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.completed ? "Completed" : "Pending"}</p>
        </div>
      ))}
    </section>
  );
};

export default TaskOverview;