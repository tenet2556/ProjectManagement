import { NextResponse } from "next/server";
import authService from "@/services/auth.service";

export const runtime = "nodejs";

const COOKIE_NAME = "token";
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK_IN_SECONDS,
  });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { type } = json;

    if (type === "login") {
      const { email, password } = json;
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      const result = await authService.login(email, password);
      const res = NextResponse.json(result, { status: 200 });
      setAuthCookie(res, result.token);
      return res;
    }

    if (type === "register") {
      const { name, email, password, role, employeeEmail, employeeName, employeeRole } = json;

      if (!name || !email || !password || !role) {
        return NextResponse.json(
          { error: "name, email, password, role are required" },
          { status: 400 }
        );
      }

      // Ensure role is a valid enum value (ADMIN | TEAM_LEADER | MEMBER)
      const roleUpper = String(role).toUpperCase();
      const ALLOWED = new Set(["ADMIN", "TEAM_LEADER", "MEMBER"]);
      if (!ALLOWED.has(roleUpper)) {
        return NextResponse.json(
          { error: "Invalid role. Use ADMIN, TEAM_LEADER, or MEMBER" },
          { status: 400 }
        );
      }

      const result = await authService.register({
        name,
        email,
        password,
        role: roleUpper,
        employeeEmail: employeeEmail ?? email,
        employeeName: employeeName ?? name,
        employeeRole: (employeeRole ?? roleUpper),
      } as any);

      const res = NextResponse.json(
        { message: "Registered successfully", user: result.user },
        { status: 201 }
      );
      setAuthCookie(res, result.token);
      return res;
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/auth error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 400 }
    );
  }
}