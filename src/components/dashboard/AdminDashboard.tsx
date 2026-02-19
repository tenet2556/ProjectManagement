"use client";

import StatsCard from "./StatsCard";
import ProjectTable from "./ProjectTable";

export default function AdminDashboard() {
  const projects = [
    { id: "1", name: "Website Redesign", status: "ACTIVE" },
    { id: "2", name: "Mobile App", status: "COMPLETED" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={12} />
        <StatsCard title="Total Projects" value={8} />
        <StatsCard title="Active Projects" value={5} />
      </div>

      <ProjectTable projects={projects} role="ADMIN" />
    </div>
  );
}
