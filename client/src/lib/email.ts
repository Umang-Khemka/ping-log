import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DownAlertParams {
  to: string;
  serviceName: string;
  serviceUrl: string;
  error: string | null;
}

/**
 * Sends an email alert when a service goes down.
 * Called from the ping route on the FIRST consecutive failure only,
 * so the user doesn't get spammed every 9 minutes while it's still down.
 */
export async function sendDownAlertEmail(params: DownAlertParams): Promise<void> {
  const { to, serviceName, serviceUrl, error } = params;

  try {
    await resend.emails.send({
      from: "Render Ping <onboarding@resend.dev>",
      to,
      subject: `🔴 ${serviceName} is down`,
      html: buildDownAlertHtml({ serviceName, serviceUrl, error }),
    });
  } catch (err: any) {
    // Don't let an email failure break the ping cycle — just log it
    console.error("Failed to send down alert email:", err.message);
  }
}

function buildDownAlertHtml({
  serviceName,
  serviceUrl,
  error,
}: {
  serviceName: string;
  serviceUrl: string;
  error: string | null;
}): string {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
    <div style="display: inline-block; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px;">
      SERVICE DOWN
    </div>
    <h2 style="font-size: 20px; margin: 0 0 8px;">${escapeHtml(serviceName)} stopped responding</h2>
    <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
      We tried to ping this service and it didn't respond successfully. This could mean it crashed, hit an error, or is taking longer than usual to wake up.
    </p>
    <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 13px; color: #71717a; margin-bottom: 4px;">URL</div>
      <div style="font-size: 14px; font-family: monospace; word-break: break-all; margin-bottom: 12px;">${escapeHtml(serviceUrl)}</div>
      ${
        error
          ? `<div style="font-size: 13px; color: #71717a; margin-bottom: 4px;">Error</div>
             <div style="font-size: 14px; font-family: monospace; color: #dc2626;">${escapeHtml(error)}</div>`
          : ""
      }
    </div>
    <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
      You'll get one alert per outage — we won't notify you again until it recovers and goes down again.
    </p>
  </div>
  `;
}

// Basic HTML escaping to prevent injection issues with user-controlled service names/URLs
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}