import { redirect } from 'next/navigation';
import { getCurrentUser, getDashboardPathForRole } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-6 pt-20">{children}</main>
      </div>
    </div>
  );
}
