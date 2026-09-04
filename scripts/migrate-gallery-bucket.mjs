/**
 * One-time migration: create gallery-photos bucket and remove legacy job-photos bucket.
 *
 * Usage: node scripts/migrate-gallery-bucket.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) throw new Error(".env.local not found");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const NEW_BUCKET = "gallery-photos";
const OLD_BUCKET = "job-photos";

async function api(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${res.status} ${text}`);
  }

  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

async function ensureBucket(name) {
  const buckets = await api("/storage/v1/bucket");
  const exists = buckets?.some?.((bucket) => bucket.name === name);

  if (exists) {
    console.log(`  Bucket "${name}" already exists`);
    return;
  }

  await api("/storage/v1/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, public: true }),
  });
  console.log(`  Created bucket "${name}"`);
}

async function listObjects(bucket) {
  const objects = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const batch = await api(
      `/storage/v1/object/list/${bucket}?limit=${limit}&offset=${offset}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "", limit, offset }),
      },
    );

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    objects.push(...batch);
    if (batch.length < limit) {
      break;
    }
    offset += limit;
  }

  return objects;
}

async function emptyBucket(bucket) {
  const objects = await listObjects(bucket);
  if (objects.length === 0) {
    console.log(`  Bucket "${bucket}" is already empty`);
    return;
  }

  const paths = objects.map((object) => object.name);
  await api(`/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: paths }),
  });
  console.log(`  Removed ${paths.length} object(s) from "${bucket}"`);
}

async function deleteBucket(bucket) {
  const buckets = await api("/storage/v1/bucket");
  const exists = buckets?.some?.((item) => item.name === bucket);
  if (!exists) {
    console.log(`  Bucket "${bucket}" already deleted`);
    return;
  }

  await api(`/storage/v1/bucket/${bucket}`, { method: "DELETE" });
  console.log(`  Deleted bucket "${bucket}"`);
}

async function main() {
  console.log("Migrating gallery storage bucket...\n");
  await ensureBucket(NEW_BUCKET);
  await emptyBucket(OLD_BUCKET);
  await deleteBucket(OLD_BUCKET);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
