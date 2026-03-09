import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import StatCard from '@/Components/dashboard/StatCard';
import ProjectCard from '@/Components/dashboard/ProjectCard';

export const dynamic = 'force-dynamic';

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const now = new Date();

  const [projectCount, activeCount, completedCount, overdueCount, teamCount, employeeCount, projects] =
    await Promise.all([
      prisma.project.count({ where: { ownerId: user.id } }),
      prisma.project.count({
        where: { ownerId: user.id, status: 'ACTIVE' },
      }),
      prisma.project.count({
        where: { ownerId: user.id, status: 'COMPLETED' },
      }),
      prisma.project.count({
        where: {
          ownerId: user.id,
          status: { not: 'COMPLETED' },
          deadline: { lt: now },
        },
      }),
      prisma.team.count({ where: { projectManagerId: user.id } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.project.findMany({
        where: { ownerId: user.id },
        include: {
          teamLead: { select: { name: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

  const projectCards = projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      projectId: p.id,
      name: p.name,
      status: p.status,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      teamLeader: p.teamLead?.name ?? null,
      progress,
    };
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">Project Manager Dashboard</h2>
        <p className="text-slate-500 mt-1">High-level overview of project health and team resources.</p>
      </div>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Projects" value={projectCount} color="blue" />
          <StatCard title="Active" value={activeCount} color="green" />
          <StatCard title="Completed" value={completedCount} color="yellow" />
          <StatCard title="Overdue" value={overdueCount} color="red" />
          <StatCard title="Teams" value={teamCount} color="purple" />
          <StatCard title="Employees" value={employeeCount} color="indigo" />
        </div>
      </section>

      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Project Management Moved</h3>
        <p className="mx-auto mt-2 max-w-sm text-slate-500">
          Detailed project lists and management tools are now located on the dedicated Projects page for better focus.
        </p>
      </div>
    </>
  );
}
