"use client";

import StatsCard from "./StatsCard";
import ProjectTable from "./ProjectTable";

export default function TeamDashboard() {
  // Mock assigned projects
  const projects = [
    { id: "1", name: "Website Redesign", status: "ACTIVE" },
  ];

  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === "ACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Member Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Assigned Projects" value={totalProjects} />
        <StatsCard title="Active Projects" value={activeProjects} />
        <StatsCard title="Completed Projects" value={totalProjects - activeProjects} />
      </div>

      {/* No edit/delete buttons will show because role is TEAM_MEMBER */}
      <ProjectTable projects={projects} role="TEAM_MEMBER" />
    </div>
  );
}
