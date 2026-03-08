import { NextResponse } from "next/server";
import { registerUser, loginUser } from "@/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // REGISTER - modified to include adminEmail for validation
    if (body.type === "register") {
    const user = await registerUser(
      body.email,
      body.password,
      body.role,
      body.adminEmail
    );

    return NextResponse.json({
      message: "User registered by admin",
      user
    });
  }

    // LOGIN
    if (body.type === "login") {
      const token = await loginUser(
        body.email,
        body.password
      );

      const response = NextResponse.json(
        { message: "Login successful" },
        { status: 200 }
      );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
