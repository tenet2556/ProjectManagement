// TEMPORARY AUTH API FOR DASHBOARD TESTING
// Can be replaced by the real auth service later.

import { NextResponse } from 'next/server';
import { loginUser, registerUser } from '@/services/auth.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body as { type?: string };

    if (type === 'register') {
      const user = await registerUser({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      });

      return NextResponse.json(
        { message: 'Registration successful', user },
        { status: 201 }
      );
    }

    if (type === 'login') {
      const { token, user } = await loginUser(body.email, body.password);

      const response = NextResponse.json({
        message: 'Login successful',
        user,
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error: any) {
    // Do not leak internal error details to the client.
    const rawMessage = typeof error?.message === 'string' ? error.message : '';

    let message = 'Internal Server Error';
    let status = 500;

    if (rawMessage === 'Invalid email or password') {
      message = rawMessage;
      status = 401;
    } else if (rawMessage === 'Invalid registration data') {
      message = 'Invalid registration data';
      status = 400;
    }

    console.error('[API /api/auth]', error);
    return NextResponse.json({ error: message }, { status });
  }
}

