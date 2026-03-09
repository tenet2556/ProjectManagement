import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';
import CreateTaskForm from '@/Components/tasks/CreateTaskForm';

export const dynamic = 'force-dynamic';

export default async function NewTaskPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Only Managers and Team Leaders can create tasks
  const isManager = user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';
  const isTeamLead = user.role === 'TEAM_LEADER';

  if (!isManager && !isTeamLead) {
    redirect('/tasks');
  }

  // Fetch projects this user can create tasks for
  const projects = await prisma.project.findMany({
    where: isManager 
      ? { ownerId: user.id } 
      : { teamLeadId: user.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Fetch all employees for assignment
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-6 pt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
            <p className="text-slate-500">Create and assign a new task to your team.</p>
          </div>

          <div className="mt-8">
            <CreateTaskForm 
              userRole={user.role} 
              availableProjects={projects} 
              availableEmployees={employees} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}
