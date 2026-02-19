export  default function TopBar() {
  const today = new Date().toLocaleDateString();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">
          Project Management Dashboard
        </h1>
        <p className="text-gray-500">
          An overview of what’s happening around.
        </p>
      </div>

      <div className="text-sm text-gray-600">
        {today}
      </div>
    </div>
  );
}
