"use client";

import Sidebar from "@/Components/Sidebar";
import TopBar from "@/Components/TopBar";
import StatCard from "@/Components/StatCard";

// TEMP: Mock user role (later from auth)
const userRole = "ADMIN"; // ADMIN | TEAM_LEADER | MEMBER

// Mock data (later from PostgreSQL via Prisma)
const mockData = {
  ADMIN: {
    projects: 12,
    completed: 7,
    pending: 4,
    overdue: 1,
  },
  TEAM_LEADER: {
    projects: 5,
    completed: 3,
    pending: 2,
    overdue: 0,
  },
  MEMBER: {
    projects: 3,
    completed: 1,
    pending: 2,
    overdue: 0,
  },
};

export default function DashboardPage() {
  const stats = mockData[userRole as keyof typeof mockData];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <TopBar />

        {/* Stat Cards (Like your reference image) */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Projects"
            value={stats.projects}
            color="bg-blue-500"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completed}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pending}
            color="bg-yellow-500"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.overdue}
            color="bg-red-500"
          />
        </div>

        {/* Projects Overview Section */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Projects Overview
          </h2>

          {/* Sample Progress Bars (Later from DB Projects) */}
          <div className="space-y-4">
            <div>
              <p className="font-medium">Project Management Portal</p>
              <div className="w-full bg-gray-200 rounded h-3">
                <div className="bg-blue-500 h-3 rounded w-[70%]" />
              </div>
            </div>

            <div>
              <p className="font-medium">AI Retail Forecasting</p>
              <div className="w-full bg-gray-200 rounded h-3">
                <div className="bg-green-500 h-3 rounded w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
