import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentProjectManagerId } from '@/lib/dashboard-data';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import CreateProjectForm from '@/Components/CreateProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const ownerId = await getCurrentProjectManagerId();
  if (!ownerId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Log in as project manager to create a project.</p>
      </div>
    );
  }

  const teamLeads = await prisma.user.findMany({
    where: { role: 'TEAM_LEADER' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      <Sidebar />
      <div className="ml-64 flex-1 min-h-screen">
        <TopBar />
        <main className="p-6 pt-24">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="mb-6 text-xl font-bold text-slate-900">Create project</h1>
            <CreateProjectForm ownerId={ownerId} teamLeads={teamLeads} />
          </div>
        </main>
      </div>
    </div>
  );
}
