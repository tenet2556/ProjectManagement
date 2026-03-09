import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const PROJECT_STATUSES = ['ACTIVE', 'COMPLETED', 'DELAYED'] as const;
type ProjectStatus = (typeof PROJECT_STATUSES)[number];

function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function isValidStatus(s: string): s is ProjectStatus {
  return PROJECT_STATUSES.includes(s as ProjectStatus);
}

/** GET /api/projects – list projects based on role */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where: any = {};
    if (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') {
      where.ownerId = user.id;
    } else if (user.role === 'TEAM_LEADER') {
      where.teamLeadId = user.id;
    } else {
      // Employees see projects they have tasks in
      where.tasks = { some: { assigneeId: user.id } };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        teamLead: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error('[API GET /api/projects]', err);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

/** POST /api/projects – create project with role validation */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Managers/Admins can create projects
    if (user.role !== 'PROJECT_MANAGER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, status, deadline, teamLeadId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const projectStatus = status != null && isValidStatus(String(status).toUpperCase())
      ? (String(status).toUpperCase() as ProjectStatus)
      : 'ACTIVE';
    const deadlineDate = parseDate(deadline);

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description != null ? String(description).trim() || null : null,
        status: projectStatus,
        deadline: deadlineDate ?? undefined,
        ownerId: user.id,
        teamLeadId: teamLeadId != null && String(teamLeadId).trim() !== '' ? String(teamLeadId) : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (err) {
    console.error('[API POST /api/projects]', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
