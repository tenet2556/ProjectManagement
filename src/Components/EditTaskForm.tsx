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
    assigneeId: string | null;
  };
  userRole: string;
  availableEmployees: { id: string; name: string }[];
}

export default function EditTaskForm({ task, userRole, availableEmployees }: EditTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(task.title);
  const [description, setDescription] = React.useState(task.description ?? '');
  const [status, setStatus] = React.useState(task.status as typeof TASK_STATUSES[number]);
  const [dueDate, setDueDate] = React.useState(toDateInputValue(task.dueDate));
  const [assigneeId, setAssigneeId] = React.useState(task.assigneeId ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const isEmployee = userRole === 'EMPLOYEE' || userRole === 'MEMBER';
  const canManageTask = userRole === 'PROJECT_MANAGER' || userRole === 'ADMIN' || userRole === 'TEAM_LEADER';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const payload: any = { status };
      
      // Only Managers or Team Leaders can update these fields
      if (canManageTask) {
        payload.title = title.trim();
        payload.description = description.trim() || null;
        payload.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
        payload.assigneeId = assigneeId || null;
      }

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update task');
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 font-medium border border-rose-200">{error}</p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 font-medium border border-emerald-200">Changes saved successfully!</p>
      )}
      
      <div>
        <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
          Title *
        </label>
        <input
          id="task-title"
          type="text"
          required
          disabled={saving || !canManageTask}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-status" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="task-status"
            disabled={saving}
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof TASK_STATUSES[number])}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all bg-white"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-dueDate" className="mb-1 block text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            id="task-dueDate"
            type="date"
            disabled={saving || !canManageTask}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="task-assignee" className="mb-1 block text-sm font-medium text-slate-700">
          Assignee
        </label>
        <select
          id="task-assignee"
          disabled={saving || !canManageTask}
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all bg-white disabled:bg-slate-50"
        >
          <option value="">Unassigned</option>
          {availableEmployees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          disabled={saving || !canManageTask}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all disabled:bg-slate-50"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-70"
        >
          {saving ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </>
          ) : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
