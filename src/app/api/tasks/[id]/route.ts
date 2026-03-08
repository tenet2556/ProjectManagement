import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

/** PATCH /api/tasks/[id] – update task (status, dueDate, title, etc.) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, dueDate, completedAt, assigneeId } = body;

    const data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      dueDate?: Date | null;
      completedAt?: Date | null;
      assigneeId?: string | null;
    } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      data.title = title.trim();
    }
    if (description !== undefined) {
      data.description = description != null && String(description).trim() !== '' ? String(description).trim() : null;
    }
    if (status !== undefined) {
      const s = String(status).toUpperCase();
      if (!isValidStatus(s)) {
        return NextResponse.json({ error: `Invalid status. Use one of: ${TASK_STATUSES.join(', ')}` }, { status: 400 });
      }
      data.status = s as TaskStatus;
    }
    if (dueDate !== undefined) {
      data.dueDate = parseDate(dueDate);
    }
    if (completedAt !== undefined) {
      data.completedAt = parseDate(completedAt);
    }
    if (assigneeId !== undefined) {
      data.assigneeId = assigneeId != null && String(assigneeId).trim() !== '' ? String(assigneeId) : null;
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
