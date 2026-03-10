import { prisma } from "@/lib/prisma";

export async function createEmployee(data: {
  name: string;
  email: string;
  role: "ADMIN" | "TEAM_LEADER" | "MEMBER";
}) {
  const existing = await prisma.employee.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Employee with this email already exists.");
  }

  return prisma.employee.create({ data });
}

export async function getEmployees() {
  return prisma.employee.findMany({
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEmployee(id: string) {
  return prisma.employee.delete({ where: { id } });
}
