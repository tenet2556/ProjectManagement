import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Token missing");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Invalid token");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
  };

  return decoded;
}