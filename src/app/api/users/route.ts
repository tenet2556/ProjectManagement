import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { requireRole } from "@/utils/roleGuard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = verifyToken(req);
    requireRole(user.role, ["ADMIN", "TEAM_LEADER"]);

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
