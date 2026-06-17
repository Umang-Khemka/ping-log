import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        emailNotifications: user.emailNotifications,
      },
    });
  } catch (error: any) {
    console.error("Error in /me route:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}