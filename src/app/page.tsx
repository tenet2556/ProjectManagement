import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 font-sans">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">
          Project & Task Management System
        </h1>
        <p className="max-w-md text-slate-600">
          Collaborative team project management. Sign in to access your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-slate-800 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
        >
          Go to Dashboard
        </Link>
      </main>
    </div>
  );
}
