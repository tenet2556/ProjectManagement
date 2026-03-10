import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { requireRole } from "@/utils/roleGuard";
import { createTask } from "@/services/task.service";

export async function POST(req: Request) {
  try {
    const user = verifyToken(req);

    requireRole(user.role, ["ADMIN", "TEAM_LEADER"]);

    const body = await req.json();

    const task = await createTask(body);

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
}