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

/** POST /api/projects – create project */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status, deadline, ownerId, teamLeadId } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const projectStatus = status != null && isValidStatus(String(status).toUpperCase())
      ? (String(status).toUpperCase() as ProjectStatus)
      : 'ACTIVE';
    const deadlineDate = parseDate(deadline);

    if (!ownerId || typeof ownerId !== 'string') {
      return NextResponse.json({ error: 'ownerId is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description != null ? String(description).trim() || null : null,
        status: projectStatus,
        deadline: deadlineDate ?? undefined,
        ownerId,
        teamLeadId: teamLeadId != null && String(teamLeadId).trim() !== '' ? String(teamLeadId) : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (err) {
    console.error('[API POST /api/projects]', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
