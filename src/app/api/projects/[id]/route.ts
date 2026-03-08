import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

/** PATCH /api/projects/[id] – update project (status, deadline, name, description, teamLeadId) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, status, deadline, teamLeadId } = body;

    const data: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
      deadline?: Date | null;
      teamLeadId?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      data.name = name.trim();
    }
    if (description !== undefined) {
      data.description = description != null && String(description).trim() !== '' ? String(description).trim() : null;
    }
    if (status !== undefined) {
      const s = String(status).toUpperCase();
      if (!isValidStatus(s)) {
        return NextResponse.json({ error: `Invalid status. Use one of: ${PROJECT_STATUSES.join(', ')}` }, { status: 400 });
      }
      data.status = s as ProjectStatus;
    }
    if (deadline !== undefined) {
      data.deadline = parseDate(deadline);
    }
    if (teamLeadId !== undefined) {
      data.teamLeadId = teamLeadId != null && String(teamLeadId).trim() !== '' ? String(teamLeadId) : null;
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(project);
  } catch (err) {
    console.error('[API PATCH /api/projects/[id]]', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
