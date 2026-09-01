import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";

const PROVIDER = "google_drive";
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getOAuthUrl(state?: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

async function loadStoredTokens() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("integration_tokens")
    .select("*")
    .eq("provider", PROVIDER)
    .maybeSingle();

  return data;
}

async function getAuthenticatedOAuthClient() {
  const client = getOAuthClient();
  const stored = await loadStoredTokens();

  if (!stored?.access_token) {
    throw new Error("Google Drive is not connected.");
  }

  client.setCredentials({
    access_token: stored.access_token,
    refresh_token: stored.refresh_token ?? undefined,
    expiry_date: stored.expires_at
      ? new Date(stored.expires_at).getTime()
      : undefined,
  });

  client.on("tokens", async (tokens) => {
    const supabase = await createClient();
    await supabase.from("integration_tokens").upsert({
      provider: PROVIDER,
      access_token: tokens.access_token ?? stored.access_token,
      refresh_token: tokens.refresh_token ?? stored.refresh_token,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : stored.expires_at,
      updated_at: new Date().toISOString(),
    });
  });

  return client;
}

export async function getDriveClient() {
  const client = await getAuthenticatedOAuthClient();
  return google.drive({ version: "v3", auth: client });
}

export async function isDriveConnected(): Promise<boolean> {
  const stored = await loadStoredTokens();
  return Boolean(stored?.refresh_token || stored?.access_token);
}

export type DriveFolder = {
  id: string;
  name: string;
};

export type DriveImage = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
};

export async function listFolders(parentId?: string): Promise<DriveFolder[]> {
  const drive = await getDriveClient();
  const query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    parentId ? `'${parentId}' in parents` : "'root' in parents",
  ].join(" and ");

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    orderBy: "name",
    pageSize: 100,
  });

  return (response.data.files ?? []).map((file) => ({
    id: file.id!,
    name: file.name ?? "Untitled folder",
  }));
}

export function getDriveRootFolderName(): string {
  return process.env.GOOGLE_DRIVE_ROOT_FOLDER_NAME?.trim() || "QTM Detailing";
}

export async function findFolderByName(
  name: string,
  parentId?: string,
): Promise<DriveFolder | null> {
  const drive = await getDriveClient();
  const escapedName = name.replace(/'/g, "\\'");
  const query = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
    `name = '${escapedName}'`,
    parentId ? `'${parentId}' in parents` : "'root' in parents",
  ].join(" and ");

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    pageSize: 1,
  });

  const file = response.data.files?.[0];
  if (!file?.id) return null;

  return {
    id: file.id,
    name: file.name ?? name,
  };
}

export async function listImagesInFolder(
  folderId: string,
): Promise<DriveImage[]> {
  const drive = await getDriveClient();
  const query = [
    `'${folderId}' in parents`,
    "trashed = false",
    "(mimeType contains 'image/')",
  ].join(" and ");

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name, mimeType, thumbnailLink)",
    orderBy: "name",
    pageSize: 100,
  });

  return (response.data.files ?? []).map((file) => ({
    id: file.id!,
    name: file.name ?? "Untitled",
    mimeType: file.mimeType ?? "image/jpeg",
    thumbnailLink: file.thumbnailLink ?? undefined,
  }));
}

export async function downloadFile(fileId: string): Promise<Buffer> {
  const drive = await getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" },
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function getFileThumbnail(
  fileId: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  const auth = await getAuthenticatedOAuthClient();
  const drive = google.drive({ version: "v3", auth });
  const accessToken = auth.credentials.access_token;

  const { data: file } = await drive.files.get({
    fileId,
    fields: "thumbnailLink,mimeType",
  });

  if (file.thumbnailLink && accessToken) {
    const response = await fetch(file.thumbnailLink, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.ok) {
      const data = Buffer.from(await response.arrayBuffer());
      return {
        data,
        contentType: response.headers.get("content-type") ?? "image/jpeg",
      };
    }
  }

  try {
    const sharp = (await import("sharp")).default;
    const original = await downloadFile(fileId);
    const data = await sharp(original)
      .rotate()
      .resize(120, 120, { fit: "cover" })
      .jpeg({ quality: 75 })
      .toBuffer();

    return { data, contentType: "image/jpeg" };
  } catch {
    return null;
  }
}

export async function saveDriveTokens(tokens: {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}) {
  const supabase = await createClient();
  await supabase.from("integration_tokens").upsert({
    provider: PROVIDER,
    access_token: tokens.access_token ?? null,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  });
}
