import Link from 'next/link';

interface ProjectCardProps {
  projectId: string;
  name: string;
  status: string;
  deadline: string | null;
  teamLeader: string | null;
  progress: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({
  projectId,
  name,
  status,
  deadline,
  teamLeader,
  progress,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${projectId}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800">{name}</h3>
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            status === 'ACTIVE'
              ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
              : status === 'COMPLETED'
                ? 'border-blue-200 bg-blue-100 text-blue-800'
                : status === 'DELAYED'
                  ? 'border-rose-200 bg-rose-100 text-rose-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
          }`}
        >
          {status}
        </span>
      </div>
      <dl className="space-y-1.5 text-sm text-slate-600">
        <div className="flex justify-between">
          <dt>Deadline</dt>
          <dd className="font-medium text-slate-700">{formatDate(deadline)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Team Leader</dt>
          <dd className="font-medium text-slate-700">{teamLeader ?? '—'}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-medium text-slate-700">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
