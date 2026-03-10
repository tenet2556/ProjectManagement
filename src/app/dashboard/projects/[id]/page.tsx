"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: { id: string; name: string; email: string };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  owner: { id: string; name: string; email: string; role: string };
  members: Member[];
  tasks: Task[];
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, apiFetch } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "", priority: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
  const [error, setError] = useState("");

  // Member management
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const canEdit = user?.role === "ADMIN" || user?.role === "TEAM_LEADER";
  const canDelete = user?.role === "ADMIN";
  const canCreateTask = user?.role === "ADMIN" || user?.role === "TEAM_LEADER";
  const canManageMembers = user?.role === "ADMIN" || user?.role === "TEAM_LEADER";

  useEffect(() => {
    loadProject();
    if (canManageMembers) loadAllUsers();
  }, [id]);

  async function loadProject() {
    try {
      const res = await apiFetch(`/api/projects/${id}`);
      const data = await res.json();
      setProject(data);
      setEditForm({
        name: data.name,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
      });
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  }

  async function loadAllUsers() {
    try {
      const res = await apiFetch("/api/users");
      const data = await res.json();
      if (Array.isArray(data)) setAllUsers(data);
    } catch {
      // handle
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setEditing(false);
      loadProject();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This will also delete all tasks.")) return;
    try {
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      router.push("/dashboard/projects");
    } catch {
      // handle
    }
  }

  async function handleAddMember() {
    if (!selectedUserId) return;
    setError("");
    try {
      const res = await apiFetch(`/api/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSelectedUserId("");
      loadProject();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await apiFetch(`/api/projects/${id}/members`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      });
      loadProject();
    } catch {
      // handle
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const body: any = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        projectId: id,
      };
      if (taskForm.assigneeId) body.assigneeId = taskForm.assigneeId;

      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setShowTaskForm(false);
      setTaskForm({ title: "", description: "", priority: "MEDIUM", assigneeId: "" });
      loadProject();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdateTaskStatus(taskId: string, status: string) {
    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      loadProject();
    } catch {
      // handle
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      loadProject();
    } catch {
      // handle
    }
  }

  if (loading) return <p className="text-gray-500">Loading project...</p>;
  if (!project) return <p className="text-gray-500">Project not found</p>;

  const memberIds = new Set(project.members.map((m) => m.id));
  const availableUsers = allUsers.filter(
    (u) => !memberIds.has(u.id) && u.id !== project.owner.id
  );

  return (
    <div>
      <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-500 mt-1">{project.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <StatusBadge value={project.status} />
              <PriorityBadge value={project.priority} />
              <span className="text-xs text-gray-400">
                Owner: {project.owner?.name || project.owner?.email}
              </span>
              <span className="text-xs text-gray-400">
                {project.members?.length || 0} members
              </span>
            </div>
          </>
        )}
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Members ({project.members?.length || 0})
          </h2>
          {canManageMembers && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showAddMember ? "Cancel" : "+ Add Member"}
            </button>
          )}
        </div>

        {showAddMember && (
          <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            >
              <option value="">Select a user to add...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — {u.role.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {project.members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
              <span className="text-gray-700">{m.name || m.email}</span>
              {m.role && (
                <span className="text-xs text-gray-400">({m.role.replace("_", " ")})</span>
              )}
              {canManageMembers && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="text-red-400 hover:text-red-600 ml-1"
                  title="Remove member"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          {project.members.length === 0 && (
            <p className="text-sm text-gray-400">No members added yet</p>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks ({project.tasks?.length || 0})</h2>
          {canCreateTask && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {showTaskForm ? "Cancel" : "+ Add Task"}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                {project.members.length > 0 ? (
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-gray-900"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-400 py-2">Add members to assign tasks</p>
                )}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Create Task
            </button>
          </form>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {project.tasks?.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <TaskStatusBadge value={task.status} />
                    <PriorityBadge value={task.priority} />
                    {task.assignee && (
                      <span className="text-xs text-gray-400">
                        Assigned: {task.assignee.name || task.assignee.email}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Status update dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700"
                  >
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                  {canCreateTask && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!project.tasks || project.tasks.length === 0) && (
            <p className="text-center py-8 text-gray-400">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[value] || "bg-gray-100"}`}>
      {value}
    </span>
  );
}

function TaskStatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
    BLOCKED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[value] || "bg-gray-100"}`}>
      {value.replace("_", " ")}
    </span>
  );
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
