import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/services/auth.service';

export type DashboardRole = 'PROJECT_MANAGER' | 'TEAM_LEADER' | 'EMPLOYEE';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * TEMPORARY AUTH FOR DASHBOARD TESTING
 *
 * Reads the JWT from the `token` cookie, verifies it, and loads the user.
 * When real authentication is integrated, this implementation can be replaced
 * while keeping the same `getCurrentUser` and `redirectToRoleDashboard` API.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    // Do not leak details; treat as unauthenticated.
    console.error('[AUTH] getCurrentUser failed', error);
    return null;
  }
}

const ROLE_REDIRECT: Record<string, string> = {
  PROJECT_MANAGER: '/dashboard/manager',
  ADMIN: '/dashboard/manager',
  TEAM_LEADER: '/dashboard/teamleader',
  MEMBER: '/dashboard/employee',
  EMPLOYEE: '/dashboard/employee',
};

export function getDashboardPathForRole(role: string): string {
  return ROLE_REDIRECT[role] ?? '/dashboard/employee';
}

/**
 * Ensures the user is logged in and redirects to the role-appropriate dashboard.
 * Call from /dashboard page.
 */
export async function redirectToRoleDashboard(): Promise<never> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  redirect(getDashboardPathForRole(user.role));
}
