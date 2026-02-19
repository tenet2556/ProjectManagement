"use client";

import { useEffect, useState } from "react";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

export default function ProjectsPage() {

  const [projects, setProjects] = useState<any[]>([]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Projects
        </h1>

        <CreateProjectModal refresh={fetchProjects} />
      </div>

      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p>{p.description}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
