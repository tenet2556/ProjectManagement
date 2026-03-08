'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const;

function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

interface EditTaskFormProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
  };
}

export default function EditTaskForm({ task }: EditTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description ?? '');
  const [status, setStatus] = React.useState(task.status as typeof TASK_STATUSES[number]);
  const [dueDate, setDueDate] = React.useState(toDateInputValue(task.dueDate));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update task');
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      )}
      <div>
        <label htmlFor="task-title" className="mb-1 block text-xs font-medium text-slate-600">
          Title *
        </label>
        <input
          id="task-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="task-status" className="mb-1 block text-xs font-medium text-slate-600">
          Status
        </label>
        <select
          id="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof TASK_STATUSES[number])}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="task-dueDate" className="mb-1 block text-xs font-medium text-slate-600">
          Due date
        </label>
        <input
          id="task-dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="task-description" className="mb-1 block text-xs font-medium text-slate-600">
          Description
        </label>
        <textarea
          id="task-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
