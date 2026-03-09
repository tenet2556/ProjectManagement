// app/api/me/route.ts
import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("token")?.value;
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: payload }, { status: 200 });
}