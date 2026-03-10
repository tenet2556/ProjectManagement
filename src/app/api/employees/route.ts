import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { requireRole } from "@/utils/roleGuard";
import { createEmployee, getEmployees } from "@/services/employee.service";

export async function POST(req: Request) {
  try {
    const user = verifyToken(req);
    requireRole(user.role, ["ADMIN"]);

    const body = await req.json();
    const employee = await createEmployee(body);

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function GET(req: Request) {
  try {
    const user = verifyToken(req);
    requireRole(user.role, ["ADMIN"]);

    const employees = await getEmployees();
    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
