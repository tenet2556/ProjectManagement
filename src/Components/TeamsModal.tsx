'use client';

import React from 'react';
import type { DashboardTeam } from '@/types/dashboard';

interface TeamsModalProps {
  teams: DashboardTeam[];
  onClose: () => void;
}

export default function TeamsModal({ teams, onClose }: TeamsModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="teams-modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="teams-modal-title" className="text-lg font-semibold text-slate-800">
            All Teams
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {teams.length === 0 ? (
            <li className="py-4 text-center text-sm text-slate-500">No teams yet.</li>
          ) : (
            teams.map((team) => (
              <li
                key={team.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800"
              >
                {team.name}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
