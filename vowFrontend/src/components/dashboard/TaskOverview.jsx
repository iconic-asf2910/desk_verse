import tasks from "../../data/tasks";

const TaskOverview = () => {
  return (
    <section>
      <h2>Tasks</h2>

      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.status}</p>
        </div>
      ))}
    </section>
  );
};

export default TaskOverview;