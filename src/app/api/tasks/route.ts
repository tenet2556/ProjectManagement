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

/** POST /api/tasks – create task */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, dueDate, projectId, assigneeId } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
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
