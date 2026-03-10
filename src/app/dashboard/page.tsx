"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  tasks: any[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project?: { name: string };
}

export default function DashboardPage() {
  const { user, apiFetch } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, taskRes] = await Promise.all([
          apiFetch("/api/projects"),
          apiFetch("/api/tasks/my"),
        ]);
        const projData = await projRes.json();
        const taskData = await taskRes.json();
        if (Array.isArray(projData)) setProjects(projData);
        if (Array.isArray(taskData)) setTasks(taskData);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiFetch]);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    TEAM_LEADER: "Team Leader",
    MEMBER: "Member",
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome, {roleLabels[user?.role || "MEMBER"]}
      </h1>
      <p className="text-gray-500 mb-8">Here&apos;s your overview</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Projects" value={projects.length} color="blue" />
        <StatCard label="My Tasks" value={totalTasks} color="purple" />
        <StatCard label="In Progress" value={inProgressTasks} color="yellow" />
        <StatCard label="Completed" value={doneTasks} color="green" />
      </div>

      {/* Recent Projects */}
      {(user?.role === "ADMIN" || user?.role === "TEAM_LEADER") && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Priority</th>
                  <th className="text-left px-6 py-3 font-medium">Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-blue-600 hover:underline font-medium">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge value={p.status} />
                    </td>
                    <td className="px-6 py-3">
                      <PriorityBadge value={p.priority} />
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.tasks?.length || 0}</td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No projects yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* My Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
          <Link href="/dashboard/tasks" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Title</th>
                <th className="text-left px-6 py-3 font-medium">Project</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-6 py-3 text-gray-600">{t.project?.name || "—"}</td>
                  <td className="px-6 py-3">
                    <StatusBadge value={t.status} />
                  </td>
                  <td className="px-6 py-3">
                    <PriorityBadge value={t.priority} />
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No tasks assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
    TODO: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    DONE: "bg-green-100 text-green-700",
    BLOCKED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[value] || "bg-gray-100 text-gray-600"}`}>
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
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[value] || "bg-gray-100 text-gray-600"}`}>
      {value}
    </span>
  );
}
