import { prisma } from '@/lib/prisma';

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assigneeId?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function getAllTasks(filters: { assigneeId?: string; projectId?: string } = {}) {
  return prisma.task.findMany({
    where: filters,
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { name: true, ownerId: true, teamLeadId: true } },
      assignee: { select: { name: true } },
    },
  });
}

export async function createTask(data: CreateTaskData) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || 'MEDIUM',
    },
  });
}

export async function updateTask(id: string, data: UpdateTaskData) {
  return prisma.task.update({
    where: { id },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
    },
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({
    where: { id },
  });
}
