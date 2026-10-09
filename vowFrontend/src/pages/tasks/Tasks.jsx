import { useMemo, useState } from "react";
import { CalendarDays, Filter, Search, Trash2 } from "lucide-react";
import useTask from "../../hooks/UseTask";
import useAuth from "../../hooks/UseAuth";
import useWorkspace from "../../hooks/UseWorkspace";

const Tasks = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useTask();

  const { user } = useAuth();
  const { workspace } = useWorkspace();

  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(user?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const members = useMemo(() => {
    if (workspace?.members?.length) {
      return workspace.members;
    }

    if (user) {
      return [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      ];
    }

    return [];
  }, [workspace?.members, user]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "All" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const completedTasks = tasks.filter((task) => task.status === "Done").length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "Done") {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return new Date(`${task.dueDate}T00:00:00`) < today;
  }).length;

  const taskEfficiency =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const workload = useMemo(() => {
    return members.map((member) => ({
      ...member,
      count: tasks.filter(
        (task) => String(task.assignedTo) === String(member.id),
      ).length,
    }));
  }, [members, tasks]);

  const maxWorkload = Math.max(...workload.map((member) => member.count), 1);

  const upcomingDeadlines = useMemo(() => {
    return [...tasks]
      .filter((task) => task.dueDate && task.status !== "Done")
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [tasks]);

  const handleAddTask = async (event) => {
    event.preventDefault();

    const taskTitle = title.trim();

    const taskAssignee = assignee || user?.id || "";

    const taskDueDate = dueDate || new Date().toISOString().split("T")[0];

    if (!taskTitle) {
      return;
    }

    await addTask({
      title: taskTitle,
      assignedTo: taskAssignee,
      dueDate: taskDueDate,
      description: "",
      status: "To Do",
      priority: "medium",
    });

    setTitle("");
    setDueDate("");
    setAssignee(user?.id || "");
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getMember = (assignedTo) => {
    return members.find((member) => String(member.id) === String(assignedTo));
  };

  const getAvatar = (member) => {
    return member?.avatar || member?.profileImage || "/manprofile.png";
  };

  const getStatusClass = (status) => {
    if (status === "Done") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "In Progress") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-red-100 text-red-700";
  };

  return (
    <div className="w-full px-6 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>

        <p className="mt-1 text-sm text-slate-600">
          Manage your workspace tasks and track your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0">
          <form
            onSubmit={handleAddTask}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
          >
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a new task."
              className="h-10 min-w-[180px] flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              className="h-10 w-[150px] rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
              {members.length === 0 ? (
                <option value="">You</option>
              ) : (
                members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              )}
            </select>

            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-10 w-[155px] rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="h-10 rounded-md bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Task
            </button>
          </form>

          <div className="mt-6">
            <h2 className="mb-3 text-lg font-medium text-slate-900">
              Activity Overview
            </h2>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Total Tasks</p>

                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {tasks.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Completed</p>

                <p className="mt-3 text-3xl font-semibold text-green-600">
                  {completedTasks}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Overdue Tasks</p>

                <p className="mt-3 text-3xl font-semibold text-orange-500">
                  {overdueTasks}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-sm text-slate-500">Task Efficiency</p>

                <div className="mt-3 flex justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#10b981 ${taskEfficiency}%, #e5e7eb ${taskEfficiency}% 100%)`,
                    }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700">
                      {taskEfficiency}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />

                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none"
                >
                  <option value="All">All</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Task."
                  className="h-9 w-40 rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="hidden grid-cols-[minmax(150px,1.5fr)_minmax(100px,1fr)_105px_105px_32px] gap-3 px-5 py-3 text-xs font-medium text-slate-500 md:grid">
              <span>Your Tasks</span>
              <span>Assignee</span>
              <span>Due Date</span>
              <span>Status</span>
              <span />
            </div>

            <div className="space-y-1.5 px-5 pb-4">
              {filteredTasks.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No tasks found.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const member = getMember(task.assignedTo);

                  return (
                    <div
                      key={task.id}
                      className="grid grid-cols-1 gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm md:grid-cols-[minmax(150px,1.5fr)_minmax(100px,1fr)_105px_105px_32px] md:items-center md:gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.status === "Done"}
                          onChange={() =>
                            updateTaskStatus(
                              task.id,
                              task.status === "Done" ? "To Do" : "Done",
                            )
                          }
                        />

                        <span
                          className={`truncate ${
                            task.status === "Done"
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-center gap-2">
                        <img
                          src={getAvatar(member)}
                          alt=""
                          className="h-6 w-6 shrink-0 rounded-full object-cover"
                        />

                        <span className="truncate text-slate-600">
                          {member?.name || task.assignedTo || "Unassigned"}
                        </span>
                      </div>

                      <span className="text-slate-500">
                        {formatDate(task.dueDate)}
                      </span>

                      <select
                        value={task.status}
                        onChange={(event) =>
                          updateTaskStatus(task.id, event.target.value)
                        }
                        className={`rounded-md border-0 px-2 py-1 text-xs font-medium outline-none ${getStatusClass(
                          task.status,
                        )}`}
                      >
                        <option value="To Do">To Do</option>

                        <option value="In Progress">In Progress</option>

                        <option value="Done">Done</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900">
              Team Workload
            </h2>

            <div className="mt-5 space-y-4">
              {workload.map((member) => {
                const width = (member.count / maxWorkload) * 100;

                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <img
                      src={getAvatar(member)}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="mb-1 truncate text-xs text-slate-600">
                        {member.name}
                      </p>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>

                    <span className="text-xs text-slate-500">
                      {member.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900">
              Upcoming Deadline
            </h2>

            <div className="mt-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="py-3 text-sm text-slate-500">
                  No upcoming deadlines.
                </p>
              ) : (
                upcomingDeadlines.map((task, index) => (
                  <div
                    key={task.id}
                    className="border-b border-slate-200 py-3 last:border-0"
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 h-5 w-1 shrink-0 rounded-full ${
                          index === 0
                            ? "bg-red-600"
                            : index === 1
                              ? "bg-orange-500"
                              : "bg-yellow-400"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-700">
                          {task.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
