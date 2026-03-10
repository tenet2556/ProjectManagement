"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: { id: string; name: string; email: string };
  project?: { id: string; name: string };
}

export default function TasksPage() {
  const { user, apiFetch } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const isMember = user?.role === "MEMBER";
  const canDelete = user?.role === "ADMIN" || user?.role === "TEAM_LEADER";

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      // Members see only their tasks; Admin/Team Leader see their tasks too
      const res = await apiFetch("/api/tasks/my");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: string) {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      loadTasks();
    } catch {
      // handle
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      loadTasks();
    } catch {
      // handle
    }
  }

  const filteredTasks = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) return <p className="text-gray-500">Loading tasks...</p>;

  const statusCounts = {
    ALL: tasks.length,
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
    BLOCKED: tasks.filter((t) => t.status === "BLOCKED").length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isMember ? "My Tasks" : "Tasks"}
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status.replace("_", " ")} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Kanban-style columns for larger screens */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-6">
        {["TODO", "IN_PROGRESS", "DONE", "BLOCKED"].map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="bg-gray-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <StatusDot status={status} />
                {status.replace("_", " ")} ({columnTasks.length})
              </h3>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canDelete={canDelete}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* List view for smaller screens */}
      <div className="lg:hidden space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canDelete={canDelete}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-center py-12 text-gray-400">No tasks found</p>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  canDelete,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  canDelete: boolean;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        <PriorityBadge value={task.priority} />
        {task.project && (
          <span className="text-xs text-gray-400">{task.project.name}</span>
        )}
        {task.assignee && (
          <span className="text-xs text-gray-400">{task.assignee.name || task.assignee.email}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700"
        >
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
          <option value="BLOCKED">Blocked</option>
        </select>
        {canDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    TODO: "bg-gray-400",
    IN_PROGRESS: "bg-yellow-400",
    DONE: "bg-green-400",
    BLOCKED: "bg-red-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`} />;
}

function PriorityBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-blue-100 text-blue-600",
    HIGH: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[value] || "bg-gray-100"}`}>
      {value}
    </span>
  );
}
