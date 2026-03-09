import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

function parseDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function isValidStatus(s: string): s is TaskStatus {
  return TASK_STATUSES.includes(s as TaskStatus);
}

/** GET /api/tasks – list tasks */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get('assigneeId');
    const projectId = searchParams.get('projectId');

    const filters: any = {};
    if (assigneeId) filters.assigneeId = assigneeId;
    if (projectId) filters.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where: filters,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (err) {
    console.error('[API GET /api/tasks]', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

/** POST /api/tasks – create task with role-based validation */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, dueDate, projectId, assigneeId } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Check project permissions
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const isManager = (user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN') && project.ownerId === user.id;
    const isTeamLead = user.role === 'TEAM_LEADER' && project.teamLeadId === user.id;

    if (!isManager && !isTeamLead) {
      return NextResponse.json({ error: 'Permission denied to create tasks for this project' }, { status: 403 });
    }

    const taskStatus = status != null && isValidStatus(String(status).toUpperCase())
      ? (String(status).toUpperCase() as TaskStatus)
      : 'PENDING';
    const dueDateParsed = parseDate(dueDate);

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description != null ? String(description).trim() || null : null,
        status: taskStatus,
        dueDate: dueDateParsed ?? undefined,
        projectId,
        assigneeId: assigneeId != null && String(assigneeId).trim() !== '' ? String(assigneeId) : undefined,
      },
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error('[API POST /api/tasks]', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
