import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { Service } from "@/models/Service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/services/:id — toggle isActive or edit name/url
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const service = await Service.findOne({ _id: id, userId: user._id });
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    // Only allow updating these specific fields
    if (typeof body.isActive === "boolean") service.isActive = body.isActive;
    if (typeof body.name === "string" && body.name.trim()) service.name = body.name.trim();
    if (typeof body.url === "string" && /^https?:\/\/.+/.test(body.url)) {
      service.url = body.url.trim();
    }

    await service.save();

    return NextResponse.json({ message: "Service updated", service });
  } catch (error: any) {
    console.error("Error in PATCH /api/services/:id:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/services/:id — remove a service
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const service = await Service.findOneAndDelete({ _id: id, userId: user._id });
    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted" });
  } catch (error: any) {
    console.error("Error in DELETE /api/services/:id:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}