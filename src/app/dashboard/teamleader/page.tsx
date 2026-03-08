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
      <h2 className="mb-6 text-xl font-bold text-slate-800">Team Leader Dashboard</h2>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My Teams" value={teams.length} color="purple" />
          <StatCard title="Active Projects" value={projectsWhereLead.filter((p) => p.status === 'ACTIVE').length} color="green" />
          <StatCard title="Tasks Pending" value={pending} color="yellow" />
          <StatCard title="Tasks Completed" value={completed} color="blue" />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-slate-800">My Teams</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <TeamCard key={t.id} teamId={t.id} name={t.name} />
          ))}
        </div>
        {teams.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No teams assigned.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-slate-800">My Projects</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectCards.map((p) => (
            <ProjectCard
              key={p.projectId}
              projectId={p.projectId}
              name={p.name}
              status={p.status}
              deadline={p.deadline}
              teamLeader={p.teamLeader}
              progress={p.progress}
            />
          ))}
        </div>
        {projectCards.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No projects where you are team lead.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Team Task Overview</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Pending Tasks" value={pending} color="yellow" />
          <StatCard title="Completed Tasks" value={completed} color="green" />
          <StatCard title="Overdue Tasks" value={overdue} color="red" />
        </div>
      </section>
    </>
  );
}
