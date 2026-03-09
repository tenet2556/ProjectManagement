import Link from 'next/link';

interface SidebarProps {
  role: string;
}

// PROJECT MANAGER SIDEBAR
const MANAGER_LINKS = [
  { href: '/dashboard/manager', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/teams', label: 'Teams' },
  { href: '/team-leaders', label: 'Team Leaders' },
  { href: '/employees', label: 'Employees' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/reports', label: 'Reports / Analytics' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings', label: 'Settings' },
];

// TEAM LEADER SIDEBAR
const TEAM_LEADER_LINKS = [
  { href: '/dashboard/teamleader', label: 'Dashboard' },
  { href: '/projects', label: 'My Projects' },
  { href: '/tasks', label: 'Team Tasks' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings', label: 'Settings' },
];

// EMPLOYEE SIDEBAR
const EMPLOYEE_LINKS = [
  { href: '/dashboard/employee', label: 'Dashboard' },
  { href: '/tasks', label: 'My Tasks' },
  { href: '/projects', label: 'My Projects' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

function getLinksForRole(role: string) {
  if (role === 'PROJECT_MANAGER' || role === 'ADMIN') return MANAGER_LINKS;
  if (role === 'TEAM_LEADER') return TEAM_LEADER_LINKS;
  return EMPLOYEE_LINKS;
}

export default function Sidebar({ role }: SidebarProps) {
  const links = getLinksForRole(role);

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-slate-900 text-slate-200 shadow-xl">
      <div className="flex h-16 items-center border-b border-slate-700/50 px-5">
        <span className="text-lg font-bold tracking-tight text-white">
          Project & Task
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-slate-700/50 pt-4">
          <Link
            href="/logout"
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-900/30 hover:text-red-300"
          >
            Logout
          </Link>
        </div>
      </nav>
    </aside>
  );
}
