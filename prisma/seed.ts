import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@pm.com";

  const existing = await prisma.employee.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin employee already exists, skipping seed.");
    return;
  }

  const employee = await prisma.employee.create({
    data: {
      name: "Admin",
      email: adminEmail,
      role: "ADMIN",
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      employeeId: employee.id,
    },
  });

  console.log("Admin user seeded successfully.");
  console.log("Email: admin@pm.com");
  console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
