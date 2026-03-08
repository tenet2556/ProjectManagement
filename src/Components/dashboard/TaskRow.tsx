import Link from 'next/link';

interface TaskRowProps {
  taskId: string;
  taskName: string;
  projectName: string;
  deadline: string | null;
  status: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskRow({
  taskId,
  taskName,
  projectName,
  deadline,
  status,
}: TaskRowProps) {
  return (
    <Link
      href={`/tasks/${taskId}`}
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-slate-50"
    >
      <div>
        <p className="font-medium text-slate-800">{taskName}</p>
        <p className="text-sm text-slate-500">{projectName}</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>Deadline: {formatDate(deadline)}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            status === 'COMPLETED'
              ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
              : status === 'OVERDUE'
                ? 'border-rose-200 bg-rose-100 text-rose-800'
                : 'border-slate-200 bg-slate-100 text-slate-700'
          }`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
