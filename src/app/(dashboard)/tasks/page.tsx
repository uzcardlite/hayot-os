"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  LOW: "Past",
  MEDIUM: "O'rta",
  HIGH: "Yuqori",
};

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  LOW: "bg-slate-700 text-slate-200",
  MEDIUM: "bg-amber-500/20 text-amber-300",
  HIGH: "bg-red-500/20 text-red-300",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    void loadTasks();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        dueDate: dueDate || null,
        priority,
      }),
    });

    setTitle("");
    setDueDate("");
    setPriority("MEDIUM");
    loadTasks();
  }

  async function toggleStatus(task: Task) {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadTasks();
  }

  async function removeTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  const pending = tasks.filter((t) => t.status !== "DONE");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-slate-50">Vazifalar</h1>
      <p className="mb-6 text-sm text-slate-400">
        Kunlik va uzoq muddatli vazifalaringizni shu yerda rejalashtiring.
      </p>

      <form
        onSubmit={addTask}
        className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          placeholder="Yangi vazifa..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        >
          <option value="LOW">Past</option>
          <option value="MEDIUM">O&apos;rta</option>
          <option value="HIGH">Yuqori</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Qo&apos;shish
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
              Bajarilmagan ({pending.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {pending.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleStatus(task)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-slate-100">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-slate-500">
                        {new Date(task.dueDate).toLocaleDateString("uz-UZ")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLOR[task.priority]}`}
                  >
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {pending.length === 0 && (
                <p className="text-sm text-slate-600">Hozircha vazifa yo&apos;q 🎉</p>
              )}
            </ul>
          </section>

          {done.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
                Bajarilgan ({done.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {done.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 opacity-60"
                  >
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggleStatus(task)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <p className="flex-1 text-sm text-slate-400 line-through">
                      {task.title}
                    </p>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
