// app/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div className={`flex h-full min-h-[88px] flex-col justify-between rounded-lg p-4 shadow-md text-white ${color}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;