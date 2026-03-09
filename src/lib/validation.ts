// lib/validation.ts
import { z } from "zod";
import { Role } from "@prisma/client";

export const LoginSchema = z.object({
  type: z.literal("login"),
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  type: z.literal("register"),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
  employeeEmail: z.string().email().optional(),
});

export const AuthBodySchema = z.discriminatedUnion("type", [
  LoginSchema,
  RegisterSchema,
]);