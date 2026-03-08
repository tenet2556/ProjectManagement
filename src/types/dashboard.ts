/**
 * Shared types for Project Manager dashboard.
 * Aligned with Prisma schema and API responses.
 */

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'DELAYED';

export interface DashboardStats {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  delayedProjects: number;
  totalTeams: number;
  totalTasks: number;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: ProjectStatus;
  deadline: string | null;
  teamLead: string;
  progress: number;
}

export interface DashboardTaskCounts {
  pending: number;
  completed: number;
  overdue: number;
}

export interface DashboardTeamPerformance {
  productivity: number;
  completionRate: number;
}

export type NotificationType = 'deadline' | 'alert' | 'info';

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  text: string;
  link?: string | null;
  createdAt?: string;
}

/** Teams list for Total Teams modal */
export interface DashboardTeam {
  id: string;
  name: string;
}

export interface ProjectManagerDashboardData {
  stats: DashboardStats;
  projects: DashboardProject[];
  teams: DashboardTeam[];
  taskCounts: DashboardTaskCounts;
  teamPerformance: DashboardTeamPerformance;
  notifications: DashboardNotification[];
}
