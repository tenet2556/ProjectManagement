import { registerUser } from "@/services/auth.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, role } = await req.json();

  try {
    const user = await registerUser(email, password, role);

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}