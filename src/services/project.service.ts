import { prisma } from "@/lib/prisma";

export class ProjectService {

  static async createProject(
    userId: string,
    role: string,
    data: {
      name: string;
      description?: string;
    }
  ) {

    // Only PM allowed
    if (role !== "PM") {
      throw new Error("Unauthorized");
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
      },
    });

    return project;
  }

  // Fetch projects based on role
  static async getProjects(userId: string, role: string) {

    if (role === "PM") {
      return prisma.project.findMany({
        include: {
          owner: true,
        },
      });
    }

    // employees → only owned projects for now
    return prisma.project.findMany({
      where: {
        ownerId: userId,
      },
    });
  }
}
