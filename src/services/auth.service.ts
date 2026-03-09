import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { signJwt } from "@/lib/jwt";

type RegisterArgs = {
  name: string;
  email: string;
  password: string;
  role: Role;
  employeeEmail?: string;
  employeeName?: string;
  employeeRole?: Role;
};

class AuthService {
  async login(email: string, password: string) {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new Error("Invalid email or password");
    }

    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async register(args: RegisterArgs) {
    const prisma = getPrisma();

    const {
      name,
      email,
      password,
      role,
      employeeEmail,
      employeeName,
      employeeRole,
    } = args;

    const targetEmployeeEmail = employeeEmail ?? email;
    const targetEmployeeName = employeeName ?? name;
    const targetEmployeeRole = employeeRole ?? role;

    return prisma.$transaction(async (tx) => {
      // 1) Prevent dup user
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) {
        throw new Error("User already exists with this email");
      }

      // 2) Create or reuse Employee (race-safe)
      const employee = await tx.employee.upsert({
        where: { email: targetEmployeeEmail },
        update: {
          // Uncomment to keep role in sync:
          // role: targetEmployeeRole,
        },
        create: {
          name: targetEmployeeName,
          email: targetEmployeeEmail,
          role: targetEmployeeRole,
        },
        select: { id: true, role: true },
      });

      // 3) Hash password
      const hashed = await bcrypt.hash(password, 10);

      // 4) Create the User linked to Employee
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          role,
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

      const token = signJwt({ id: user.id, email: user.email, role: user.role });

      return { user, token };
    });
  }
}

export default new AuthService();