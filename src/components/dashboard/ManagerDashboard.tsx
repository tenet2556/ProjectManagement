"use client";

import StatsCard from "./StatsCard";
import ProjectTable from "./ProjectTable";

export default function ManagerDashboard() {
  // Mock data (replace with API later)
  const projects = [
    { id: "1", name: "Website Redesign", status: "ACTIVE" },
    { id: "2", name: "Internal Tool", status: "COMPLETED" },
  ];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === "ACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Project Manager Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="My Projects" value={totalProjects} />
        <StatsCard title="Active Projects" value={activeProjects} />
        <StatsCard title="Completed Projects" value={totalProjects - activeProjects} />
      </div>

      {/* Projects Table */}
      <ProjectTable projects={projects} role="PROJECT_MANAGER" />
    </div>
  );
}
