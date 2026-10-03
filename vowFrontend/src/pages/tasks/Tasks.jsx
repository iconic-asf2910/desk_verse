import { useState } from "react";
import useTask from "../../hooks/UseTask";

const Tasks = () => {
  const [task, setTask] = useState("");

  const { tasks, addTask, toggleTask, removeTask } = useTask();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!task.trim()) return;

    addTask(task);
    setTask("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f3f4f6] px-8 py-7">
      <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl gap-3">
        <input
          type="text"
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Add a task..."
          className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Task
        </button>
      </form>

      <section className="mt-6 max-w-2xl">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <span
                  className={`text-sm ${
                    item.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {item.title}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTask(item.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                      item.completed
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.completed ? "Undo" : "Complete"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeTask(item.id)}
                    className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Tasks;
