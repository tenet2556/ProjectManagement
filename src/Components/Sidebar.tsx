"use client";

import Link from "next/link";

export  default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-black text-white p-5">
      <h1 className="text-2xl font-bold mb-8">Project OS</h1>

      <button className="bg-blue-600 px-4 py-2 rounded mb-6 w-full">
        Create New
      </button>

      <nav className="space-y-4">
        <Link href="/dashboard" className="block hover:text-blue-400">
          Dashboard
        </Link>
        <Link href="/projects" className="block hover:text-blue-400">
          Projects
        </Link>
        <Link href="/tasks" className="block hover:text-blue-400">
          Tasks
        </Link>
        <Link href="/analytics" className="block hover:text-blue-400">
          Analytics
        </Link>
      </nav>
    </div>
  );
}
