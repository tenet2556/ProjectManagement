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
      <h2 className="mb-6 text-xl font-bold text-slate-800">Employee Dashboard</h2>

      <section className="mb-8">
        <h3 className="sr-only">Statistics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My Tasks" value={myTasks} color="blue" />
          <StatCard title="Completed Tasks" value={completedTasks} color="green" />
          <StatCard title="Pending Tasks" value={pendingTasks} color="yellow" />
          <StatCard title="Overdue Tasks" value={overdueTasks} color="red" />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-slate-800">My Task List</h3>
        <ul className="space-y-2">
          {assignedTasks.map((task) => (
            <li key={task.id}>
              <TaskRow
                taskId={task.id}
                taskName={task.title}
                projectName={task.project.name}
                deadline={task.dueDate ? task.dueDate.toISOString() : null}
                status={task.status}
              />
            </li>
          ))}
        </ul>
        {assignedTasks.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No tasks assigned to you.
          </p>
        )}
      </section>

      <section>
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
            No projects from your assigned tasks.
          </p>
        )}
      </section>
    </>
  );
}
