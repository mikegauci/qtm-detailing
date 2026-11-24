import { createHmac, timingSafeEqual } from "node:crypto";
import OpenAI from "openai";
import { EXPENSE_CATEGORIES } from "@/lib/admin/partner-split";
import { createServiceClient } from "@/lib/supabase/service";

const RESEND_API = "https://api.resend.com";
const INVOICE_BUCKET = "expense-invoices";
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

/** English and Maltese words that suggest an email carries a bill. The AI makes the final call. */
const INVOICE_KEYWORDS =
  /\b(invoices?|inv[-\s#]?\d+|receipts?|bills?|statement|fattur[ai]|ri[cċ]evut[ai]|kont)\b/i;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heic",
};
/** Formats OpenAI can read directly; HEIC is still stored, just not read. */
const AI_READABLE = new Set(["pdf", "jpg", "png", "webp"]);

type ResendAttachment = {
  id: string;
  filename: string | null;
  content_type: string;
  content_disposition: string | null;
  size: number;
  download_url: string;
};

type ReceivedEmail = {
  id: string;
  from: string;
  subject: string | null;
  text: string | null;
  html: string | null;
  created_at: string;
};

type Extraction = {
  is_invoice: boolean;
  vendor: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number | null;
  currency: string | null;
  category: (typeof EXPENSE_CATEGORIES)[number];
  line_items: { description: string; amount: number; max_only_equipment: boolean }[];
  description: string;
  notes: string | null;
};

export type InboundResult = { status: "stored" | "duplicate" | "ignored"; reason?: string };

/** Verifies a Svix-signed (Resend) webhook. `secret` is the `whsec_…` signing secret. */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest();

  return signatures.split(" ").some((entry) => {
    const [version, value] = entry.split(",");
    if (version !== "v1" || !value) return false;
    const given = Buffer.from(value, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

async function resendGet<T>(path: string): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured.");
  const res = await fetch(`${RESEND_API}${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend ${path} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

function htmlToText(html: string) {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extensionFor(att: Pick<ResendAttachment, "content_type" | "filename">) {
  const byType = EXTENSION_BY_TYPE[att.content_type.toLowerCase()];
  if (byType) return byType;
  const ext = att.filename?.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "jpeg") return "jpg";
  return Object.values(EXTENSION_BY_TYPE).includes(ext) ? ext : null;
}

/** PDFs always count; images only when attached (inline images are usually logos and signatures). */
function isInvoiceCandidate(att: ResendAttachment) {
  const ext = extensionFor(att);
  if (!ext || att.size > MAX_ATTACHMENT_BYTES) return false;
  if (ext === "pdf") return true;
  return att.content_disposition !== "inline" && att.size > 15 * 1024;
}

const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_invoice",
    "vendor",
    "invoice_number",
    "invoice_date",
    "total_amount",
    "currency",
    "category",
    "line_items",
    "description",
    "notes",
  ],
  properties: {
    is_invoice: {
      type: "boolean",
      description:
        "True only if the attachments include an invoice, bill or receipt that QTM Detailing has to pay or has paid. False for quotes, newsletters, marketing, or invoices QTM issued to its own customers.",
    },
    vendor: { type: ["string", "null"], description: "Supplier name." },
    invoice_number: { type: ["string", "null"] },
    invoice_date: { type: ["string", "null"], description: "Invoice date as YYYY-MM-DD." },
    total_amount: {
      type: ["number", "null"],
      description: "Total amount payable including VAT, as a plain number.",
    },
    currency: { type: ["string", "null"], description: "ISO currency code, e.g. EUR." },
    category: {
      type: "string",
      enum: [...EXPENSE_CATEGORIES],
      description:
        "utilities = water and electricity bills (e.g. ARMS, Enemalta, WSC). products = detailing products, chemicals, tools, equipment, supplies. other = anything else.",
    },
    line_items: {
      type: "array",
      description:
        "Every product or service line on the invoice. Each amount must include that line's share of VAT, discounts and delivery so the lines add up to total_amount. Use a single line for bills without itemised products (e.g. utilities).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["description", "amount", "max_only_equipment"],
        properties: {
          description: { type: "string", description: "Short item name with quantity, e.g. 'Rupes LHR15 polisher x1'." },
          amount: { type: "number" },
          max_only_equipment: {
            type: "boolean",
            description:
              "True for durable equipment or machinery the owner buys for himself (polishers, pressure washers, vacuums, steamers, extractors, generators, compressors, lights). False for consumables and supplies (chemicals, shampoos, coatings, pads, microfibres, air fresheners, towels), delivery, utilities and services.",
          },
        },
      },
    },
    description: {
      type: "string",
      description: "Short expense description, e.g. 'Flawless Finish INV-7707: polishing pads'.",
    },
    notes: {
      type: ["string", "null"],
      description: "Anything the reviewer should double-check (unclear total, non-EUR currency, several invoices).",
    },
  },
} as const;

async function extractInvoice(
  email: { from: string; subject: string; body: string },
  files: { filename: string; ext: string; contentType: string; data: Buffer }[],
): Promise<Extraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const openai = new OpenAI({ apiKey });

  const readable = files.filter((f) => AI_READABLE.has(f.ext));
  const response = await openai.responses.create({
    model: process.env.OPENAI_INVOICE_MODEL || "gpt-5.4-mini",
    instructions:
      "You read supplier invoices for QTM Detailing, a car detailing business in Malta. Extract the fields from the attached documents (prefer the documents over the email text). Use null when a value is not shown. Never invent numbers.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body.slice(0, 4000)}`,
          },
          ...readable.map((f) =>
            f.ext === "pdf"
              ? {
                  type: "input_file" as const,
                  filename: f.filename,
                  file_data: `data:application/pdf;base64,${f.data.toString("base64")}`,
                }
              : {
                  type: "input_image" as const,
                  detail: "high" as const,
                  image_url: `data:${f.contentType};base64,${f.data.toString("base64")}`,
                },
          ),
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "invoice",
        strict: true,
        schema: EXTRACTION_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  return JSON.parse(response.output_text) as Extraction;
}

/**
 * Turns the AI's lines into expense items that add up exactly to the invoice total:
 * small gaps (VAT or rounding the AI missed) are spread proportionally, and the last
 * line absorbs the final cent.
 */
function fitLinesToTotal(lines: Extraction["line_items"], total: number | null) {
  const clean = lines
    .filter((l) => Number.isFinite(l.amount) && l.amount >= 0 && l.description.trim())
    .slice(0, 50)
    .map((l) => ({
      description: l.description.trim().slice(0, 200),
      amount: Math.round(l.amount * 100) / 100,
      shared: !l.max_only_equipment,
    }));
  const sum = clean.reduce((s, l) => s + l.amount, 0);
  if (!clean.length || total == null || sum <= 0 || Math.abs(sum - total) < 0.005) return clean;

  const factor = total / sum;
  let running = 0;
  return clean.map((l, i) => {
    const amount =
      i === clean.length - 1
        ? Math.round((total - running) * 100) / 100
        : Math.round(l.amount * factor * 100) / 100;
    running += amount;
    return { ...l, amount };
  });
}

function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    ? value
    : null;
}

/** Fetches a received email from Resend, decides if it is an invoice, and queues it for review. */
export async function processInboundEmail(emailId: string): Promise<InboundResult> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("expense_inbox")
    .select("id")
    .eq("resend_email_id", emailId)
    .maybeSingle();
  if (existing) return { status: "duplicate" };

  const email = await resendGet<ReceivedEmail>(`/emails/receiving/${emailId}`);
  const { data: attachments } = await resendGet<{ data: ResendAttachment[] }>(
    `/emails/receiving/${emailId}/attachments?limit=100`,
  );

  const candidates = attachments.filter(isInvoiceCandidate).slice(0, MAX_ATTACHMENTS);
  if (!candidates.length) return { status: "ignored", reason: "no PDF or image attachments" };

  const subject = email.subject ?? "";
  const body = email.text?.trim() || (email.html ? htmlToText(email.html) : "");
  const haystack = [subject, body, ...candidates.map((a) => a.filename ?? "")].join("\n");
  if (!INVOICE_KEYWORDS.test(haystack)) {
    return { status: "ignored", reason: "no invoice keywords" };
  }

  const files = await Promise.all(
    candidates.map(async (att) => {
      const res = await fetch(att.download_url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Attachment download failed: ${res.status}`);
      const ext = extensionFor(att)!;
      return {
        filename: att.filename ?? `attachment.${ext}`,
        ext,
        contentType: att.content_type,
        data: Buffer.from(await res.arrayBuffer()),
      };
    }),
  );

  const extraction = await extractInvoice({ from: email.from, subject, body }, files);
  if (!extraction.is_invoice) return { status: "ignored", reason: "AI: not an invoice" };

  const paths: string[] = [];
  for (const file of files) {
    const path = `invoices/${crypto.randomUUID()}.${file.ext}`;
    const { error } = await supabase.storage
      .from(INVOICE_BUCKET)
      .upload(path, file.data, { contentType: file.contentType, upsert: false });
    if (error) {
      if (paths.length) await supabase.storage.from(INVOICE_BUCKET).remove(paths);
      throw new Error(`Storage upload failed: ${error.message}`);
    }
    paths.push(path);
  }

  const total =
    extraction.total_amount != null && Number.isFinite(extraction.total_amount)
      ? Math.round(extraction.total_amount * 100) / 100
      : null;
  const items = fitLinesToTotal(extraction.line_items, total);
  const currency = extraction.currency?.toUpperCase();
  const notes = [
    extraction.notes,
    currency && currency !== "EUR" ? `Amount is in ${currency}, not EUR.` : null,
    files.some((f) => !AI_READABLE.has(f.ext)) ? "Some photos (HEIC) could not be read automatically." : null,
  ]
    .filter(Boolean)
    .join(" ");

  const { error } = await supabase.from("expense_inbox").insert({
    resend_email_id: emailId,
    from_email: email.from,
    subject,
    received_at: email.created_at,
    attachment_paths: paths,
    vendor: extraction.vendor,
    invoice_number: extraction.invoice_number,
    invoice_date: validDate(extraction.invoice_date),
    amount: total ?? (items.length ? items.reduce((sum, i) => sum + i.amount, 0) : null),
    suggested_category: extraction.category,
    // One line: no breakdown needed, the expense-level flag carries the split.
    suggested_shared: items.length === 1 ? items[0].shared : true,
    items: items.length > 1 ? items : [],
    description: extraction.description,
    ai_notes: notes || null,
  });

  if (error) {
    await supabase.storage.from(INVOICE_BUCKET).remove(paths);
    // A concurrent retry of the same webhook already stored it.
    if (error.code === "23505") return { status: "duplicate" };
    throw new Error(`Inbox insert failed: ${error.message}`);
  }
  return { status: "stored" };
}
