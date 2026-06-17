import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Service } from "@/models/Service";

// GET /api/services — list current user's services
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const services = await Service.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error("Error in GET /api/services:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/services — add a new service to ping
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, url } = await req.json();

    if (!name || !url) {
      return NextResponse.json({ message: "Name and URL are required" }, { status: 400 });
    }

    // Basic URL validation
    if (!/^https?:\/\/.+/.test(url)) {
      return NextResponse.json(
        { message: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    await connectDB();

    // Prevent duplicate URLs for the same user
    const existing = await Service.findOne({ userId: user._id, url });
    if (existing) {
      return NextResponse.json(
        { message: "You're already tracking this URL" },
        { status: 400 }
      );
    }

    const service = await Service.create({
      userId: user._id,
      name,
      url,
    });

    return NextResponse.json({ message: "Service added", service }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/services:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}