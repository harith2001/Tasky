import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type Task = {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" }[]
  >([]);

  const pushToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000
    );
  };

  const load = async (all = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = all
        ? `${API_BASE}/api/tasks`
        : `${API_BASE}/api/tasks?limit=${pageSize}`;
      const res = await fetch(url);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (title.length > 200) {
      setError("Title too long");
      return;
    }
    if (description.length > 1000) {
      setError("Description too long");
      return;
    }
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => null);
        const msg = data?.error || "Failed to add task";
        pushToast(msg, "error");
        return;
      }
      setTitle("");
      setDescription("");
      pushToast("Task added successfully", "success");
      await load();
    } catch (err) {
      pushToast("Network error adding task", "error");
    }
  };

  const completeTask = async (id: number) => {
    await fetch(`${API_BASE}/api/tasks/${id}/complete`, { method: "PATCH" });
    await load();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white p-4 font-display relative"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
       <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none"></div>
       <div className="relative z-10 text-white p-4 font-display">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded px-4 py-2 shadow text-white ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <header className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Tasky</h1>
        <p className="text-white">Your simple, stylish task manager</p>
      </header>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="bg-gray-900 rounded-xl shadow p-6 mx-auto md:col-span-1 w-full">
          <h2 className="text-xl font-semibold mb-4">Add a Task</h2>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-400"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border rounded px-3 py-2 bg-gray-800 text-white placeholder-gray-400"
              rows={4}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={addTask}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setTitle("");
                  setDescription("");
                  setError(null);
                }}
                className="text-blue-600 px-3 py-2 underline"
              >
                Clear
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>

        <div className="bg-transparent rounded-xl shadow p-6 mx-auto md:col-span-2 w-full min-h-[420px]">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          {loading && <p>Loading...</p>}
          {!loading && tasks.length === 0 && <p>No tasks</p>}
          <ul className="space-y-3">
            {tasks.slice((page - 1) * pageSize, page * pageSize).map((t) => (
              <li
                key={t.id}
                className="border border-gray-700 rounded px-3 py-2 flex items-center justify-between bg-gray-800"
              >
                <div>
                  <p className="font-medium text-white">{t.title}</p>
                  {t.description && (
                    <p className="text-sm text-gray-300">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => completeTask(t.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Done
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-4">
            <button
              className="px-4 py-2 rounded bg-[rgb(31,41,55)] text-white border border-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="text-sm text-gray-200">Page {page}</div>
            <button
              className="px-4 py-2 rounded bg-[rgb(31,41,55)] text-white border border-gray-700 disabled:opacity-50"
              onClick={() =>
                setPage((p) => (p * pageSize < tasks.length ? p + 1 : p))
              }
              disabled={page * pageSize >= tasks.length}
            >
              Next
            </button>
          </div>
          <div className="mt-2 text-right">
            <button
              className="text-blue-400 underline"
              onClick={() => load(true)}
            >
              Load all
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
