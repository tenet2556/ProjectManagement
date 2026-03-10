import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { requireRole } from "@/utils/roleGuard";
import { addMemberToProject, removeMemberFromProject } from "@/services/project.service";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(req);
    requireRole(user.role, ["ADMIN", "TEAM_LEADER"]);

    const { id } = await context.params;
    const { userId } = await req.json();

    const project = await addMemberToProject(id, userId);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(req);
    requireRole(user.role, ["ADMIN", "TEAM_LEADER"]);

    const { id } = await context.params;
    const { userId } = await req.json();

    const project = await removeMemberFromProject(id, userId);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
