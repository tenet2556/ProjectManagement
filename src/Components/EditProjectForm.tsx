'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'DELAYED'] as const;

function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

interface EditProjectFormProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    deadline: Date | null;
    teamLeadId: string | null;
  };
  teamLeads: { id: string; name: string }[];
}

export default function EditProjectForm({ project, teamLeads }: EditProjectFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(project.name);
  const [description, setDescription] = React.useState(project.description ?? '');
  const [status, setStatus] = React.useState(project.status as typeof PROJECT_STATUSES[number]);
  const [deadline, setDeadline] = React.useState(toDateInputValue(project.deadline));
  const [teamLeadId, setTeamLeadId] = React.useState(project.teamLeadId ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          status,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          teamLeadId: teamLeadId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update project');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      )}
      <div>
        <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700">
          Project name *
        </label>
        <input
          id="edit-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="edit-description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="edit-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="edit-status" className="mb-1 block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="edit-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof PROJECT_STATUSES[number])}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="edit-deadline" className="mb-1 block text-sm font-medium text-slate-700">
          Deadline
        </label>
        <input
          id="edit-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="edit-teamLeadId" className="mb-1 block text-sm font-medium text-slate-700">
          Team Lead
        </label>
        <select
          id="edit-teamLeadId"
          value={teamLeadId}
          onChange={(e) => setTeamLeadId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">— None —</option>
          {teamLeads.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
