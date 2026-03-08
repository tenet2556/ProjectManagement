import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * REGISTER USER - modified to include adminEmail for validation
 * - Must exist in Employee table
 * - Role must match
 */
export async function registerUser(
  email: string,
  password: string,
  role: string,
  adminEmail: string
) {
  // check admin exists
  const admin = await prisma.employee.findUnique({
    where: { email: adminEmail }
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Only ADMIN can register users.");
  }

  // check employee exists
  const employee = await prisma.employee.findUnique({
    where: { email }
  });

  if (!employee) {
    throw new Error("Employee not found.");
  }

  // check role matches
  if (employee.role !== role) {
    throw new Error("Role mismatch.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: employee.name,
      email: employee.email,
      password: hashedPassword,
      role: employee.role,
      employeeId: employee.id
    }
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
