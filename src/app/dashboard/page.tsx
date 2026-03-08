import { redirectToRoleDashboard } from '@/lib/auth';

/**
 * Root dashboard route: redirects to role-specific dashboard based on user role from database.
 */
export default async function DashboardPage() {
  await redirectToRoleDashboard();
}
