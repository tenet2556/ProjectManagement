import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';
import EditTaskForm from '@/Components/EditTaskForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [task, employees] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-6 pt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Task Details</h1>
            <p className="text-slate-500">Project: {task.project.name}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Edit Task</h2>
                <EditTaskForm 
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    dueDate: task.dueDate,
                    assigneeId: task.assigneeId,
                  }} 
                  userRole={user.role}
                  availableEmployees={employees}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Information</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">Assignee</p>
                    <p className="font-medium text-slate-900">{task.assignee?.name || 'Unassigned'}</p>
                    {task.assignee?.email && <p className="text-xs text-slate-400">{task.assignee.email}</p>}
                  </div>
                  <div>
                    <p className="text-slate-500">Created At</p>
                    <p className="font-medium text-slate-900">{task.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Updated</p>
                    <p className="font-medium text-slate-900">{task.updatedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
