import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { PingLog } from "@/models/PingLog";
import { User } from "@/models/User";
import { sendDownAlertEmail } from "@/lib/email";

const PING_TIMEOUT_MS = 30000;

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
      cache: "no-store",
    });
    clearTimeout(timeout);

    const responseTimeMs = Date.now() - startTime;

    return {
      success: response.ok || response.status < 500,
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
    const secret = req.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch services WITHOUT populate
    const services = await Service.find({ isActive: true });

    if (services.length === 0) {
      return NextResponse.json({ message: "No active services to ping", pinged: 0 });
    }

    // Manually fetch all relevant users in one query
    const userIds = [...new Set(services.map((s) => s.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }, "email emailNotifications");
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Ping all services in parallel
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
          userId: service.userId,
          success: result.success,
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs,
          error: result.error,
        });

        // Send email only on the FIRST failure
        const isFirstFailure = !result.success && !wasFailingBefore;
        const user = userMap.get(service.userId.toString());

        console.log(`[ping debug] service=${service.name} success=${result.success} wasFailingBefore=${wasFailingBefore} isFirstFailure=${isFirstFailure} user=${user?.email}`);

        if (isFirstFailure && user?.emailNotifications && user?.email) {
          await sendDownAlertEmail({
            to: user.email,
            serviceName: service.name,
            serviceUrl: service.url,
            error: result.error,
          });
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