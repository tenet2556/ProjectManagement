// TEMPORARY AUTH FOR DASHBOARD TESTING
// This module can be removed once the real authentication service is integrated.

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// JWT secret must be provided via environment for security.
// This demo auth shares the same contract as the real auth service.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for authentication');
}

export type AuthRole = 'PROJECT_MANAGER' | 'TEAM_LEADER' | 'EMPLOYEE' | 'ADMIN' | 'MEMBER';

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TokenPayload {
  userId: string;
  role: string;
}

// TEMPORARY: simple registration for local testing only.
export async function registerUser(params: {
  name?: string;
  email: string;
  password: string;
  role: AuthRole;
}): Promise<AuthUserPayload> {
  const { name, email, password, role } = params;

  // Basic email validation
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid registration data');
  }

  // Password validation – prevent empty or very weak passwords
  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    throw new Error('Invalid registration data');
  }

  // Role validation – only allow known roles
  const allowedRoles: AuthRole[] = ['PROJECT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE', 'ADMIN', 'MEMBER'];
  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid registration data');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Invalid registration data');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name ?? email.split('@')[0],
      email,
      password: hashedPassword,
      role,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUserPayload }> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Use a generic error message for security.
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

