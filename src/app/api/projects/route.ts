import { NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";

/*
 Replace later with NextAuth session
*/
async function getSessionUser() {
  return {
    userId: "demo-user-id",
    role: "PM",
  };
}

// GET PROJECTS
export async function GET() {
  const session = await getSessionUser();

  const projects = await ProjectService.getProjects(
    session.userId,
    session.role
  );

  return NextResponse.json(projects);
}

// CREATE PROJECT
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();

    const project = await ProjectService.createProject(
      session.userId,
      session.role,
      body
    );

    return NextResponse.json(project);

  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }
}
