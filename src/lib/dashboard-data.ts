/**
 * Dashboard data layer for Project Manager.
 * Fetches from PostgreSQL via Prisma. Progress is computed from task completion.
 */

import { prisma } from '@/lib/prisma';
import type { ProjectManagerDashboardData, ProjectStatus } from '@/types/dashboard';

// Safe access for Team/Notification (may be missing if Prisma client was generated before these models existed)
const prismaAny = prisma as { team?: { findMany: (args: unknown) => Promise<{ id: string; name: string }[]> }; notification?: { findMany: (args: unknown) => Promise<{ id: string; type: string; text: string; link: string | null; createdAt: Date }[]> } };

const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'DELAYED'] as const;
type ProjectStatusDb = (typeof PROJECT_STATUSES)[number];
const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const;

type ProjectWithRelations = {
  id: string;
  name: string;
  status: string;
  deadline: Date | null;
  teamLead: { name: string } | null;
  tasks: { id: string; status: string }[];
};

/**
 * Get current project manager user id.
 * Replace with your auth layer when ready (e.g. getSession().user.id).
 */
export async function getCurrentProjectManagerId(): Promise<string | null> {
  // TODO: Replace with real auth – e.g. const session = await getSession(); return session?.user?.id ?? null;
  const pm = await prisma.user.findFirst({
    where: { role: 'PROJECT_MANAGER' },
    select: { id: true },
  });
  return pm?.id ?? null;
}

export async function getProjectManagerDashboardData(
  userId?: string | null
): Promise<ProjectManagerDashboardData | null> {
  try {
    const projectManagerId = userId ?? (await getCurrentProjectManagerId());
    if (!projectManagerId) return null;

    const teamsPromise = prismaAny.team?.findMany?.({
      where: { projectManagerId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }) ?? Promise.resolve([]);
    const notificationsPromise = prismaAny.notification?.findMany?.({
      where: { userId: projectManagerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, type: true, text: true, link: true, createdAt: true },
    }) ?? Promise.resolve([]);

    const [projects, teams, taskCountsAgg, notifications, allTasksByProject] = (await Promise.all([
      prisma.project.findMany({
        where: { ownerId: projectManagerId },
        include: {
          teamLead: { select: { name: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      } as any),
      teamsPromise,
      prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { ownerId: projectManagerId },
        },
        _count: { id: true },
      }),
      notificationsPromise,
      prisma.project.findMany({
        where: { ownerId: projectManagerId },
        select: { id: true, tasks: { select: { status: true } } },
      }),
    ])) as unknown as [
    ProjectWithRelations[],
    { id: string; name: string }[],
    { status: string; _count: { id: number } }[],
    { id: string; type: string; text: string; link: string | null; createdAt: Date }[],
    { id: string; tasks: { status: string }[] }[],
  ];

  const statusCounts = PROJECT_STATUSES.reduce(
    (acc: Record<ProjectStatusDb, number>, s) => ({ ...acc, [s]: projects.filter((p: { status: string }) => p.status === s).length }),
    { ACTIVE: 0, COMPLETED: 0, DELAYED: 0 } as Record<ProjectStatusDb, number>
  );

  const taskCountsMap = taskCountsAgg.reduce<Record<string, number>>(
    (acc, row: { status: string; _count: { id: number } }) => ({ ...acc, [row.status]: row._count.id }),
    {}
  );
  const pending =
    (taskCountsMap.PENDING ?? 0) +
    (taskCountsMap.IN_PROGRESS ?? 0);
  const completed = taskCountsMap.COMPLETED ?? 0;
  const overdue = taskCountsMap.OVERDUE ?? 0;
  const totalTasks = pending + completed + overdue;

  const completedTotal = allTasksByProject.reduce(
    (sum: number, p: { tasks: { status: string }[] }) =>
      sum + p.tasks.filter((t: { status: string }) => t.status === 'COMPLETED').length,
    0
  );
  const totalTaskCount = allTasksByProject.reduce(
    (sum: number, p: { tasks: unknown[] }) => sum + p.tasks.length,
    0
  );
  const completionRate = totalTaskCount > 0 ? Math.round((completedTotal / totalTaskCount) * 100) : 0;
  const productivity = completionRate;

  const dashboardProjects = projects.map(
    (p: {
      id: string;
      name: string;
      status: string;
      deadline: Date | null;
      teamLead: { name: string } | null;
      tasks: { status: string }[];
    }) => {
      const taskList = p.tasks;
      const total = taskList.length;
      const completedCount = taskList.filter((t: { status: string }) => t.status === 'COMPLETED').length;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        status: p.status as ProjectStatus,
        deadline: p.deadline ? p.deadline.toISOString().slice(0, 10) : null,
        teamLead: p.teamLead?.name ?? '—',
        progress,
      };
    }
  );

  return {
    stats: {
      totalProjects: projects.length,
      ongoingProjects: statusCounts.ACTIVE ?? 0,
      completedProjects: statusCounts.COMPLETED ?? 0,
      delayedProjects: statusCounts.DELAYED ?? 0,
      totalTeams: teams.length,
      totalTasks,
    },
    projects: dashboardProjects,
    teams: teams.map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })),
    taskCounts: { pending, completed, overdue },
    teamPerformance: { productivity, completionRate },
    notifications: notifications.map(
      (n: { id: string; type: string; text: string; link: string | null; createdAt: Date }) => ({
        id: n.id,
        type: n.type as 'deadline' | 'alert' | 'info',
        text: n.text,
        link: n.link ?? undefined,
        createdAt: n.createdAt.toISOString(),
      })
    ),
  };
  } catch (err) {
    console.error('[dashboard-data]', err);
    return null;
  }
}
