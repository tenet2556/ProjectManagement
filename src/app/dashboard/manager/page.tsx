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
      <h2 className="mb-6 text-xl font-bold text-slate-800">Project Manager Dashboard</h2>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Projects" value={projectCount} color="blue" />
          <StatCard title="Active Projects" value={activeCount} color="green" />
          <StatCard title="Completed Projects" value={completedCount} color="yellow" />
          <StatCard title="Overdue Projects" value={overdueCount} color="red" />
          <StatCard title="Total Teams" value={teamCount} color="purple" />
          <StatCard title="Total Employees" value={employeeCount} color="indigo" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-bold text-slate-800">Project Overview</h3>
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
            No projects yet.
          </p>
        )}
      </section>
    </>
  );
}
