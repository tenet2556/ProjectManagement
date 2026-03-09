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

/** GET /api/tasks/[id] – get single task */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error('[API GET /api/tasks/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

/** PATCH /api/tasks/[id] – update task with role-based validation */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, dueDate, completedAt, assigneeId } = body;

    // Fetch existing task to check permissions
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isManager = user.role === 'PROJECT_MANAGER' || user.role === 'ADMIN';
    const isTeamLead = user.role === 'TEAM_LEADER' && existingTask.project.teamLeadId === user.id;
    const isAssignee = existingTask.assigneeId === user.id;

    const data: any = {};

    // Logic: 
    // - Managers/Admins can update anything.
    // - Team Leaders can update anything in their projects.
    // - Employees can ONLY update status/completedAt of their OWN tasks.
    
    if (isManager || isTeamLead) {
      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
        }
        data.title = title.trim();
      }
      if (description !== undefined) {
        data.description = description != null && String(description).trim() !== '' ? String(description).trim() : null;
      }
      if (dueDate !== undefined) {
        data.dueDate = parseDate(dueDate);
      }
      if (assigneeId !== undefined) {
        data.assigneeId = assigneeId != null && String(assigneeId).trim() !== '' ? String(assigneeId) : null;
      }
    } else if (!isAssignee) {
      // If not manager, not team lead, and not assignee -> No permission at all
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Both Leaders and Assignees can update status
    if (status !== undefined) {
      const s = String(status).toUpperCase();
      if (!isValidStatus(s)) {
        return NextResponse.json({ error: `Invalid status` }, { status: 400 });
      }
      data.status = s as TaskStatus;
      if (s === 'COMPLETED' && !existingTask.completedAt) {
        data.completedAt = new Date();
      }
    }
    if (completedAt !== undefined && (isManager || isTeamLead)) {
      data.completedAt = parseDate(completedAt);
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error('[API PATCH /api/tasks/[id]]', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
