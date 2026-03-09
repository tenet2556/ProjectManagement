'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'DELAYED'] as const;

interface CreateProjectFormProps {
  ownerId: string;
  teamLeads: { id: string; name: string }[];
}

export default function CreateProjectForm({ ownerId, teamLeads }: CreateProjectFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<typeof PROJECT_STATUSES[number]>('ACTIVE');
  const [deadline, setDeadline] = React.useState('');
  const [teamLeadId, setTeamLeadId] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          ownerId,
          teamLeadId: teamLeadId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create project');
        return;
      }
      router.push('/projects');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 font-medium border border-rose-200">{error}</p>
      )}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Project Name *
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="e.g., Q2 Marketing Strategy"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="What is this project about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Initial Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof PROJECT_STATUSES[number])}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deadline" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Target Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="teamLeadId" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Assign Team Lead
        </label>
        <select
          id="teamLeadId"
          value={teamLeadId}
          onChange={(e) => setTeamLeadId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
        >
          <option value="">— Select a Team Lead —</option>
          {teamLeads.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
        >
          {saving ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
