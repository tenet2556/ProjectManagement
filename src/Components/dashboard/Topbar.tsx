import type { CurrentUser } from '@/lib/auth';

interface TopbarProps {
  user: CurrentUser;
}

export default function Topbar({ user }: TopbarProps) {
  return (
    <header className="fixed top-0 left-64 right-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role}</p>
        </div>
      </div>
    </header>
  );
}
