import { getResendConfig } from "@/lib/env";
import { getResendClient } from "@/lib/email/resend";

export type LeadNotificationData = {
  name: string;
  email: string;
  phone?: string;
  vehicle?: string;
  message?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatField(label: string, value: string | undefined): string {
  const display = value?.trim() || "—";
  return `<tr>
    <td style="padding:8px 12px 8px 0;font-weight:600;color:#374151;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#111827;">${escapeHtml(display)}</td>
  </tr>`;
}

function buildLeadNotificationHtml(lead: LeadNotificationData): string {
  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Malta",
  }).format(new Date());

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;">New quote request</h1>
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Submitted via the website contact form on ${escapeHtml(submittedAt)}.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.5;">
            ${formatField("Name", lead.name)}
            ${formatField("Email", lead.email)}
            ${formatField("Phone", lead.phone)}
            ${formatField("Vehicle", lead.vehicle)}
            ${formatField("Message", lead.message)}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendLeadNotification(
  lead: LeadNotificationData,
): Promise<void> {
  const config = getResendConfig();
  if (!config) {
    console.warn(
      "RESEND_API_KEY is not set — skipping lead notification email.",
    );
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    return;
  }

  const { error } = await resend.emails.send({
    from: config.fromEmail,
    to: config.notificationEmail,
    replyTo: lead.email,
    subject: `New quote request from ${lead.name}`,
    html: buildLeadNotificationHtml(lead),
  });

  if (error) {
    throw new Error(error.message);
  }
}
