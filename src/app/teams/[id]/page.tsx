interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPlaceholderPage({ params }: PageProps) {
  await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8">
      <p className="text-slate-600">
        Team detail page – to be implemented by the team owner.
      </p>
    </div>
  );
}
