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
      className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-400 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${
          status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
          status === 'OVERDUE' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
        }`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{taskName}</p>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{projectName}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Deadline</p>
          <p className="text-sm font-semibold text-slate-700">{formatDate(deadline)}</p>
        </div>
        <span
          className={`min-w-[100px] text-center rounded-lg border px-3 py-1 text-xs font-bold ${
            status === 'COMPLETED'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : status === 'OVERDUE'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {status}
        </span>
        <svg className="h-4 w-4 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
