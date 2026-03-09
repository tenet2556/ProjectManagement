import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import StatCard from '@/Components/dashboard/StatCard';
import TaskRow from '@/Components/dashboard/TaskRow';
import ProjectCard from '@/Components/dashboard/ProjectCard';

export const dynamic = 'force-dynamic';

export default async function EmployeeDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'EMPLOYEE' && user.role !== 'MEMBER') {
    redirect('/dashboard');
  }

  const [assignedTasks, projectIdsFromTasks] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: user.id },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.task.findMany({
      where: { assigneeId: user.id },
      select: { projectId: true },
      distinct: ['projectId'],
    }),
  ]);

  const myProjectIds = projectIdsFromTasks.map((t) => t.projectId);

  const [taskStatusCounts, projects] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: user.id },
      _count: { id: true },
    }),
    myProjectIds.length > 0
      ? prisma.project.findMany({
          where: { id: { in: myProjectIds } },
          include: {
            tasks: { where: { assigneeId: user.id }, select: { status: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const statusMap = taskStatusCounts.reduce(
    (acc, row) => ({ ...acc, [row.status]: row._count.id }),
    {} as Record<string, number>
  );
  const myTasks = assignedTasks.length;
  const completedTasks = statusMap.COMPLETED ?? 0;
  const pendingTasks = (statusMap.PENDING ?? 0) + (statusMap.IN_PROGRESS ?? 0);
  const overdueTasks = statusMap.OVERDUE ?? 0;

  const projectCards = projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
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
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">Employee Dashboard</h2>
        <p className="text-slate-500 mt-1">Quick overview of your performance and task status.</p>
      </div>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Tasks" value={myTasks} color="blue" />
          <StatCard title="Completed" value={completedTasks} color="green" />
          <StatCard title="Pending" value={pendingTasks} color="yellow" />
          <StatCard title="Overdue" value={overdueTasks} color="red" />
        </div>
      </section>

      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Task Details Moved</h3>
        <p className="mx-auto mt-2 max-w-sm text-slate-500">
          Detailed task lists and project overviews have been moved to their dedicated management pages for a cleaner workflow.
        </p>
      </div>
    </>
  );
}
