// lib/auth-types.ts
import { Role } from "@prisma/client";

export type JwtPayload = {
  id: string;
  email: string;
  role: Role;
};

export type LoginResult = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
  };
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  // Optional: link to an existing employee by email OR create a new one.
  // If you want admins to assign employees, include adminEmail or employeeId.
  employeeEmail?: string;
};

export type RegisterResult = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
  };
};