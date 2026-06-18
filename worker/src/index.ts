/**
 * Render Ping — Cloudflare Worker
 *
 * Runs on a cron schedule (every 9 minutes) and calls our Next.js
 * /api/ping endpoint, which pings all active services across all users.
 *
 * This Worker is intentionally "dumb" — it doesn't know about individual
 * service URLs. All that logic lives in the Next.js backend. The Worker's
 * only job is to be an always-on heartbeat that triggers the ping cycle.
 */

export interface Env {
  PING_ENDPOINT_URL: string; // e.g. https://your-app.vercel.app/api/ping
  CRON_SECRET: string; // must match CRON_SECRET in your Next.js .env
  VERCEL_AUTOMATION_BYPASS_SECRET: string;
}

export default {
  // Triggered automatically by the cron schedule defined in wrangler.toml
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(triggerPing(env));
  },

  // Also expose a manual HTTP trigger for testing/debugging in the browser
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/trigger") {
      const result = await triggerPing(env);
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Render Ping Worker is alive. Use /trigger to manually fire a ping.", {
      status: 200,
    });
  },
};

async function triggerPing(env: Env): Promise<{ success: boolean; status?: number; body?: unknown; error?: string }> {
  try {
    const response = await fetch(env.PING_ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": env.CRON_SECRET,
          "x-vercel-protection-bypass": env.VERCEL_AUTOMATION_BYPASS_SECRET,
      },
    });

    const body = await response.json();

    console.log(`Ping cycle completed — status ${response.status}`, body);

    return { success: response.ok, status: response.status, body };
  } catch (error: any) {
    console.error("Failed to trigger ping:", error.message);
    return { success: false, error: error.message };
  }
}