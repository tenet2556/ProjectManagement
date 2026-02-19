"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  return (
    <aside className="w-64 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <nav className="space-y-3">
        <Link href="/dashboard">Overview</Link>

        {role === "ADMIN" && (
          <>
            <Link href="/dashboard/users">Users</Link>
            <Link href="/dashboard/projects">All Projects</Link>
          </>
        )}

        {role === "PROJECT_MANAGER" && (
          <Link href="/dashboard/projects">My Projects</Link>
        )}

        {role === "TEAM_MEMBER" && (
          <Link href="/dashboard/tasks">My Tasks</Link>
        )}
      </nav>
    </aside>
  );
}
