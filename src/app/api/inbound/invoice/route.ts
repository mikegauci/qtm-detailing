import { NextResponse } from "next/server";
import { processInboundEmail, verifyWebhookSignature } from "@/lib/finance/invoice-inbox";

export const maxDuration = 300;

/** Resend `email.received` webhook: emails sent to finance@ are copied here by Purelymail. */
export async function POST(request: Request) {
  const secret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[invoice-inbox] RESEND_INBOUND_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: { email_id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailId = event.data?.email_id;
  if (event.type !== "email.received" || !emailId) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    const result = await processInboundEmail(emailId);
    console.log(`[invoice-inbox] ${emailId}: ${result.status}${result.reason ? ` (${result.reason})` : ""}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[invoice-inbox] ${emailId} failed`, error);
    // A 5xx makes Resend retry the delivery later.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
