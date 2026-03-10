import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { getMyTasks } from "@/services/task.service";

export async function GET(req: Request) {
  const user = verifyToken(req);

  const tasks = await getMyTasks(user.userId);

  return NextResponse.json(tasks);
}