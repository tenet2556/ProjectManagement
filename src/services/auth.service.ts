import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * REGISTER USER
 * - Must exist in Employee table
 * - Role must match
 */
export async function registerUser(
  email: string,
  password: string,
  role: string
) {
  //  Check employee exists
  const employee = await prisma.employee.findUnique({
    where: { email },
  });

  if (!employee) {
    throw new Error("You are not authorized to register.");
  }

  //  Validate role match
  if (employee.role !== role) {
    throw new Error("Role mismatch. Registration denied.");
  }

  //  Check if already registered
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already registered.");
  }

  //  Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //  Create user in User table
  const user = await prisma.user.create({
    data: {
      name: employee.name,
      email: employee.email,
      password: hashedPassword,
      role: employee.role, // always from Employee
      employeeId: employee.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * LOGIN USER
 */
export async function loginUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not registered.");
  }

  const isValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isValid) {
    throw new Error("Invalid credentials.");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return token;
}