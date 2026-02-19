interface StatCardProps {
  title: string;
  value: number;
  color: string;
}

export  default function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-xl text-white shadow-md ${color}`}>
      <h2 className="text-lg">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
