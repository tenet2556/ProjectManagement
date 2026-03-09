import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';
import CreateProjectForm from '@/Components/CreateProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Only Managers and Admins can create projects
  if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
    redirect('/projects');
  }

  // Fetch all team leads for project assignment
  const teamLeads = await prisma.user.findMany({
    where: { role: 'TEAM_LEADER' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-8 pt-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Project</h1>
            <p className="text-slate-500 mt-1">Initialize a new project and assign a team lead.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm max-w-2xl">
            <CreateProjectForm 
              ownerId={user.id} 
              teamLeads={teamLeads} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
