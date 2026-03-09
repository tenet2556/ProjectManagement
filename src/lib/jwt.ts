import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Fail fast if misconfigured
  throw new Error("JWT_SECRET is not set in environment variables.");
}

type JwtPayload = {
  id: string;
  email: string;
  role: Role;
};

export function signJwt(payload: JwtPayload, opts?: jwt.SignOptions) {
  return jwt.sign(payload, SECRET!, { expiresIn: "7d", ...opts });
}

export function verifyJwt<T = JwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET!) as T;
  } catch {
    return null;
  }
}