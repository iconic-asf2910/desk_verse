import { useState } from "react";

const Tasks = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!task.trim()) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: task.trim(),
      completed: false,
    };

    setTasks((previousTasks) => [...previousTasks, newTask]);
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

  const deleteTask = (id) => {
    setTasks((previousTasks) =>
      previousTasks.filter((item) => item.id !== id)
    );
  };

  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f6f8] px-8 py-7">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your workspace tasks and track your progress.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <input
            type="text"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Enter a new task..."
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Tasks</p>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>

            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              {completedTasks}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-slate-800">
            Your Tasks
          </h2>

          <div className="mt-4">
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No tasks added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {tasks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleTask(item.id)}
                      className="h-4 w-4 accent-blue-600"
                    />

                    <p
                      className={`min-w-0 flex-1 text-sm ${
                        item.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {item.title}
                    </p>

                    <button
                      type="button"
                      onClick={() => deleteTask(item.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;