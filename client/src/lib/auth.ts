import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { connectDB } from "./db";
import { User, IUser } from "@/models/User";

/**
 * Reads the jwt cookie from the request, verifies it, and returns the user.
 * Returns null if not authenticated. Use this at the top of any protected route.
 *
 * Usage:
 *   const user = await getAuthUser(req);
 *   if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
 */
export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
  try {
    const token = req.cookies.get("jwt")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);

    await connectDB();
    const user = await User.findById(decoded.id);

    return user;
  } catch (error) {
    return null;
  }
}