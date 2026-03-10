"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems: { label: string; href: string; roles: string[] }[] = [
    { label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "TEAM_LEADER", "MEMBER"] },
    { label: "Projects", href: "/dashboard/projects", roles: ["ADMIN", "TEAM_LEADER", "MEMBER"] },
    { label: "My Tasks", href: "/dashboard/tasks", roles: ["MEMBER"] },
    { label: "All Tasks", href: "/dashboard/tasks", roles: ["ADMIN", "TEAM_LEADER"] },
    { label: "Employees", href: "/dashboard/employees", roles: ["ADMIN"] },
  ];

  const filtered = navItems.filter((item) => item.roles.includes(user.role));

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    TEAM_LEADER: "bg-yellow-100 text-yellow-700",
    MEMBER: "bg-green-100 text-green-700",
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Admin",
    TEAM_LEADER: "Team Leader",
    MEMBER: "Member",
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-bold">PM Tool</h2>
        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold ${roleColors[user.role]}`}>
          {roleLabels[user.role]}
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
