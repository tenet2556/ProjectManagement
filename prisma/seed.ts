import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  let pm = await prisma.user.findFirst({ where: { role: 'PROJECT_MANAGER' } });
  if (!pm) {
    pm = await prisma.user.create({
      data: {
        name: 'Project Manager',
        email: 'pm@example.com',
        password: hashedPassword,
        role: 'PROJECT_MANAGER',
      },
    });
  }

  let lead1 = await prisma.user.findFirst({ where: { email: 'lead1@example.com' } });
  if (!lead1) {
    lead1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'lead1@example.com',
        password: hashedPassword,
        role: 'TEAM_LEADER',
      },
    });
  }

  let lead2 = await prisma.user.findFirst({ where: { email: 'lead2@example.com' } });
  if (!lead2) {
    lead2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'lead2@example.com',
        password: hashedPassword,
        role: 'TEAM_LEADER',
      },
    });
  }

  let emp = await prisma.user.findFirst({ where: { email: 'emp@example.com' } });
  if (!emp) {
    emp = await prisma.user.create({
      data: {
        name: 'Alice Employee',
        email: 'emp@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });
  }

  const existingTeams = await prisma.team.count({ where: { projectManagerId: pm.id } });
  if (existingTeams === 0) {
    await prisma.team.createMany({
      data: [
        { name: 'Frontend Team', projectManagerId: pm.id },
        { name: 'Backend Team', projectManagerId: pm.id },
      ],
    });
  }

  const existingProjects = await prisma.project.count({ where: { ownerId: pm.id } });
  if (existingProjects === 0) {
    const p1 = await prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Main site overhaul',
        status: 'ACTIVE',
        deadline: new Date('2026-05-15'),
        ownerId: pm.id,
        teamLeadId: lead1.id,
      },
    });
    const p2 = await prisma.project.create({
      data: {
        name: 'Mobile App Development',
        status: 'ACTIVE',
        deadline: new Date('2026-06-30'),
        ownerId: pm.id,
        teamLeadId: lead2.id,
      },
    });
    const p3 = await prisma.project.create({
      data: {
        name: 'Marketing Campaign',
        status: 'COMPLETED',
        deadline: new Date('2026-02-10'),
        ownerId: pm.id,
        teamLeadId: lead1.id,
      },
    });
    const p4 = await prisma.project.create({
      data: {
        name: 'Data Migration',
        status: 'DELAYED',
        deadline: new Date('2026-03-01'),
        ownerId: pm.id,
        teamLeadId: lead2.id,
      },
    });
    const allTasks: { title: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'; projectId: string }[] = [];
    for (const projectId of [p1.id, p2.id, p3.id, p4.id]) {
      allTasks.push(
        { title: 'Task 1', status: 'COMPLETED', projectId },
        { title: 'Task 2', status: 'COMPLETED', projectId },
        { title: 'Task 3', status: 'PENDING', projectId },
        { title: 'Task 4', status: 'IN_PROGRESS', projectId },
        { title: 'Task 5', status: 'OVERDUE', projectId },
      );
    }
    await prisma.task.createMany({ data: allTasks });
    const tasksToAssign = await prisma.task.findMany({ where: { projectId: p1.id }, take: 3 });
    for (const t of tasksToAssign) {
      await prisma.task.update({ where: { id: t.id }, data: { assigneeId: emp.id } });
    }
  }

  const existingNotifications = await prisma.notification.count({ where: { userId: pm.id } });
  if (existingNotifications === 0) {
    await prisma.notification.createMany({
      data: [
        { type: 'deadline', text: 'Project "Website Redesign" deadline approaching in 3 weeks.', userId: pm.id },
        { type: 'alert', text: 'Alert: Data Migration project is delayed by 5 days.', userId: pm.id },
        { type: 'info', text: 'New task assigned to team.', userId: pm.id },
      ],
    });
  }

  console.log('Seed completed. PM id:', pm.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
