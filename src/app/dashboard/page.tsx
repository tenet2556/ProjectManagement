"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import TeamDashboard from "@/components/dashboard/TeamDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Later this will come from session
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  if (!role) return <p>Loading...</p>;

  if (role === "ADMIN") return <AdminDashboard />;
  if (role === "PROJECT_MANAGER") return <ManagerDashboard />;
  return <TeamDashboard />;
}
