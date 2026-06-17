import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    // Clear the cookie by setting maxAge to 0
    response.cookies.set("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error in logout route:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}