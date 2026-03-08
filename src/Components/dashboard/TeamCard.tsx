import Link from 'next/link';

interface TeamCardProps {
  teamId: string;
  name: string;
}

export default function TeamCard({ teamId, name }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${teamId}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="text-base font-semibold text-slate-800">{name}</h3>
    </Link>
  );
}
