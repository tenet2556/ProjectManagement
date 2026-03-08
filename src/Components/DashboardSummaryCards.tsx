'use client';

import React from 'react';
import StatCard from '@/Components/StatCard';
import TeamsModal from '@/Components/TeamsModal';
import type { DashboardStats, DashboardTeam } from '@/types/dashboard';

interface DashboardSummaryCardsProps {
  stats: DashboardStats;
  teams: DashboardTeam[];
  pendingTasks: number;
}

export default function DashboardSummaryCards({
  stats,
  teams,
  pendingTasks,
}: DashboardSummaryCardsProps) {
  const [teamsModalOpen, setTeamsModalOpen] = React.useState(false);

  return (
    <section className="mb-8">
      <h2 className="sr-only">Summary</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Projects" value={stats.totalProjects} color="bg-blue-500" />
        <StatCard title="Ongoing Projects" value={stats.ongoingProjects} color="bg-green-500" />
        <StatCard title="Completed Projects" value={stats.completedProjects} color="bg-yellow-500" />
        <StatCard title="Delayed Projects" value={stats.delayedProjects} color="bg-red-500" />
        <button
          type="button"
          onClick={() => setTeamsModalOpen(true)}
          className="h-full w-full text-left transition-opacity hover:opacity-90"
        >
          <StatCard title="Total Teams" value={stats.totalTeams} color="bg-purple-500" />
        </button>
        <div className="relative group h-full">
          <StatCard title="Total Tasks" value={stats.totalTasks} color="bg-indigo-500" />
          <div
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            role="tooltip"
          >
            Pending tasks: {pendingTasks}
          </div>
        </div>
      </div>
      {teamsModalOpen && (
        <TeamsModal teams={teams} onClose={() => setTeamsModalOpen(false)} />
      )}
    </section>
  );
}
