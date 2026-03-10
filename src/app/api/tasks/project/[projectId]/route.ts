import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { getTasksByProject } from "@/services/task.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  verifyToken(req);

  const { projectId } = await params;

  const tasks = await getTasksByProject(projectId);

  return NextResponse.json(tasks);
}