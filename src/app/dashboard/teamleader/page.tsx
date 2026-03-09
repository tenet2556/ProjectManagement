import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import StatCard from '@/Components/dashboard/StatCard';
import TeamCard from '@/Components/dashboard/TeamCard';
import ProjectCard from '@/Components/dashboard/ProjectCard';

export const dynamic = 'force-dynamic';

export default async function TeamLeaderDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'TEAM_LEADER') {
    redirect('/dashboard');
  }

  const [teams, projectsWhereLead, taskCounts] = await Promise.all([
    prisma.team.findMany({
      where: { projectManagerId: user.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.project.findMany({
      where: { teamLeadId: user.id },
      include: {
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: {
        project: { teamLeadId: user.id },
      },
      _count: { id: true },
    }),
  ]);

  const statusCounts = taskCounts.reduce(
    (acc, row) => ({ ...acc, [row.status]: row._count.id }),
    {} as Record<string, number>
  );
  const pending = (statusCounts.PENDING ?? 0) + (statusCounts.IN_PROGRESS ?? 0);
  const completed = statusCounts.COMPLETED ?? 0;
  const overdue = statusCounts.OVERDUE ?? 0;

  const projectCards = projectsWhereLead.map((p) => {
    const total = p.tasks.length;
    const completedTasks = p.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = total > 0 ? Math.round((completedTasks / total) * 100) : 0;
    return {
      projectId: p.id,
      name: p.name,
      status: p.status,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      teamLeader: null,
      progress,
    };
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">Team Leader Dashboard</h2>
        <p className="text-slate-500 mt-1">Monitor your team's workload and project progress.</p>
      </div>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My Teams" value={teams.length} color="purple" />
          <StatCard title="Active Projects" value={projectsWhereLead.filter((p) => p.status === 'ACTIVE').length} color="green" />
          <StatCard title="Tasks Pending" value={pending} color="yellow" />
          <StatCard title="Tasks Completed" value={completed} color="blue" />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-slate-800 tracking-tight">Team Task Overview</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard title="Pending Tasks" value={pending} color="yellow" />
          <StatCard title="Completed Tasks" value={completed} color="green" />
          <StatCard title="Overdue Tasks" value={overdue} color="red" />
        </div>
      </section>

      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Lists Moved to Dedicated Pages</h3>
        <p className="mx-auto mt-2 max-w-sm text-slate-500">
          Detailed team and project lists have been moved to their respective pages for a more streamlined management experience.
        </p>
      </div>
    </>
  );
}
