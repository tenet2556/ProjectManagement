import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const colorClasses: Record<NonNullable<StatCardProps['color']>, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
};

export default function StatCard({ title, value, color = 'blue' }: StatCardProps) {
  return (
    <div
      className={`flex h-full min-h-[88px] flex-col justify-between rounded-xl p-5 text-white shadow-lg ${colorClasses[color]}`}
    >
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
    </div>
  );
}
