import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { PingLog } from "@/models/PingLog";
import { sendDownAlertEmail } from "@/lib/email";
import "@/models/User"; // Ensure User model is registered for population

const PING_TIMEOUT_MS = 30000; // 30 seconds — Render cold starts can be slow

interface PingResult {
  serviceId: string;
  name: string;
  url: string;
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  error: string | null;
}

async function pingUrl(url: string): Promise<Omit<PingResult, "serviceId" | "name" | "url">> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      // Avoid caching — we want a fresh request every time
      cache: "no-store",
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;

    return {
      success: response.ok || response.status < 500, // treat 4xx as "service is awake"
      statusCode: response.status,
      responseTimeMs,
      error: null,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - startTime;

    return {
      success: false,
      statusCode: null,
      responseTimeMs,
      error: error.name === "AbortError" ? "Request timed out" : error.message,
    };
  }
}

// POST /api/ping — triggered by Cloudflare Worker cron every 9 minutes
export async function POST(req: NextRequest) {
  try {
    // Verify the secret header — only our Cloudflare Worker should be able to call this
    const secret = req.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all active services across all users
    const services = await Service.find({ isActive: true }).populate("userId");

    if (services.length === 0) {
      return NextResponse.json({ message: "No active services to ping", pinged: 0 });
    }

    // Ping all services in parallel for speed
    const results = await Promise.all(
      services.map(async (service) => {
        const result = await pingUrl(service.url);

        const wasFailingBefore = service.consecutiveFailures > 0;

        // Update service status
        service.lastPingedAt = new Date();
        service.lastStatus = result.success ? "up" : "down";
        service.lastStatusCode = result.statusCode;
        service.consecutiveFailures = result.success ? 0 : service.consecutiveFailures + 1;
        await service.save();

        // Log this ping
        await PingLog.create({
          serviceId: service._id,
          userId: service.userId._id || service.userId,
          success: result.success,
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs,
          error: result.error,
        });

        // Send email only on the FIRST failure (not every 9 min while still down)
        const isFirstFailure = !result.success && !wasFailingBefore;

        console.log(`[ping debug] service=${service.name} success=${result.success} wasFailingBefore=${wasFailingBefore} isFirstFailure=${isFirstFailure} userIdType=${typeof service.userId}`);

        if (isFirstFailure && service.userId && typeof service.userId === "object") {
          const user = service.userId as any;
          console.log(`[ping debug] user.email=${user.email} user.emailNotifications=${user.emailNotifications}`);
          if (user.emailNotifications && user.email) {
            await sendDownAlertEmail({
              to: user.email,
              serviceName: service.name,
              serviceUrl: service.url,
              error: result.error,
            });
          }
        }

        return {
          serviceId: service._id.toString(),
          name: service.name,
          url: service.url,
          success: result.success,
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs,
          error: result.error,
        };
      })
    );

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Pinged ${results.length} services`,
      pinged: results.length,
      successful: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error: any) {
    console.error("Error in ping route:", error.message);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}