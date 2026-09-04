import { Resend } from "resend";
import { getResendConfig } from "@/lib/env";

let client: Resend | null = null;

export function getResendClient(): Resend | null {
  const config = getResendConfig();
  if (!config) {
    return null;
  }

  if (!client) {
    client = new Resend(config.apiKey);
  }

  return client;
}
