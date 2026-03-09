import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Sidebar from '@/Components/dashboard/Sidebar';
import Topbar from '@/Components/dashboard/Topbar';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const isManager = user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';

  const where: any = {};
  if (isManager) {
    where.ownerId = user.id;
  } else if (user.role === 'TEAM_LEADER') {
    where.teamLeadId = user.id;
  } else {
    where.tasks = { some: { assigneeId: user.id } };
  }

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: { select: { name: true } },
      teamLead: { select: { name: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar role={user.role} />
      <div className="ml-64 flex-1 min-h-screen">
        <Topbar user={user} />
        <main className="p-8 pt-24">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
              <p className="text-slate-500 mt-1">Overview of all active and upcoming projects.</p>
            </div>
            {isManager && (
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    project.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : project.status === 'DELAYED' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-slate-100 text-slate-800'
                  }`}>
                    {project.status}
                  </span>
                  <p className="text-xs text-slate-400">
                    {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'}
                  </p>
                </div>
                
                <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                  {project.name}
                </h3>
                <p className="mb-6 line-clamp-2 text-sm text-slate-500 min-h-[40px]">
                  {project.description || 'No description provided.'}
                </p>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium uppercase tracking-wider">Team Lead</span>
                    <span className="text-slate-900 font-semibold">{project.teamLead?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium uppercase tracking-wider">Tasks</span>
                    <span className="text-slate-900 font-semibold">{project._count.tasks} total</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/tasks?projectId=${project.id}`}
                    className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    View Project Tasks
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-3">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No projects found</h3>
              <p className="mx-auto mt-2 max-w-sm text-slate-500">
                {isManager 
                  ? "You haven't created any projects yet. Start by creating your first project." 
                  : "You are not assigned to any projects at the moment."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
