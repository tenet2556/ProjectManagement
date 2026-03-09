import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';
import TaskList from '@/Components/tasks/TaskList';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isLeader = user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN' || user.role === 'TEAM_LEADER';

  const tasks = await prisma.task.findMany({
    where: user.role === 'EMPLOYEE' || user.role === 'MEMBER'
      ? { assigneeId: user.id }
      : user.role === 'TEAM_LEADER'
      ? { project: { teamLeadId: user.id } }
      : { project: { ownerId: user.id } },
    include: {
      project: { select: { name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-8 pt-24">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
              <p className="text-slate-500 mt-1">Manage and track your team's progress.</p>
            </div>
            {isLeader && (
              <Link
                href="/tasks/new"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </Link>
            )}
          </div>

          <TaskList initialTasks={tasks} />

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-3">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No tasks found</h3>
              <p className="mx-auto mt-2 max-w-sm text-slate-500">
                {isLeader 
                  ? "You haven't created any tasks yet. Click the button above to get started." 
                  : "You don't have any tasks assigned to you right now."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
