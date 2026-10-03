import { useState } from "react";

const Tasks = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!task.trim()) {
      return;
    }

    setTasks((previousTasks) => [
      ...previousTasks,
      {
        id: Date.now(),
        title: task.trim(),
        completed: false,
      },
    ]);

    setTask("");
  };

  const toggleTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.map((item) =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  return (
    <div>
      <h1>Tasks</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Add a task..."
        />
        <button type="submit">Add Task</button>
      </form>

      <section>
        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          tasks.map((item) => (
            <div key={item.id}>
              <span>{item.title}</span>
              <button
                type="button"
                onClick={() => toggleTask(item.id)}
              >
                {item.completed ? "Completed" : "Complete"}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Tasks;