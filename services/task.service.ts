import { prisma } from "@/lib/prisma";

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: Date;
}) {
  if (data.assigneeId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { members: { select: { id: true } } },
    });
    if (!project) throw new Error("Project not found.");
    const isMember = project.members.some((m) => m.id === data.assigneeId);
    if (!isMember) throw new Error("Assignee must be a member of this project.");
  }

  return prisma.task.create({ data });
}

export async function getTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: true,
      comments: true,
    },
  });
}

export async function getMyTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      assigneeId: userId,
    },
    include: {
      project: true,
    },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      comments: true,
      project: true,
    },
  });
}

export async function updateTask(id: string, data: any) {
  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}