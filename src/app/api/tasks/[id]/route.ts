import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { requireRole } from "@/utils/roleGuard";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/services/task.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  verifyToken(req);

  const { id } = await params;

  const task = await getTaskById(id);

  return NextResponse.json(task);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(req);

    const { id } = await params;

    const body = await req.json();

    const task = await updateTask(id, body);

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = verifyToken(req);

    requireRole(user.role, ["ADMIN", "TEAM_LEADER"]);

    const { id } = await params;

    const task = await deleteTask(id);

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
}