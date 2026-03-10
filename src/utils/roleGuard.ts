export function requireRole(
  userRole: string,
  allowedRoles: string[]
) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }
}