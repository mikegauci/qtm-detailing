/**
 * One-time migration: upload public/ CMS images to Supabase Storage
 * and update database URLs. Requires temp anon upload policy (see migration).
 *
 * Usage: node scripts/migrate-cms-assets.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase URL or API key in .env.local");
}

const BUCKET = "cms-assets";

const SERVICE_IMAGES = [
  { slug: "premium-interior-deep-clean", file: "premium-interior-deep-clean.jpg" },
  { slug: "exterior-detail", file: "exterior-detail-v2.jpg" },
  { slug: "complete-detail", file: "complete-detail.jpg" },
  { slug: "paint-enhancement", file: "paint-enhancement.jpg" },
  { slug: "complete-paint-enhancement", file: "complete-paint-enhancement.jpg" },
  { slug: "premium-wax-protection", file: "premium-wax-protection.jpg" },
  { slug: "ceramic-paint-protection", file: "ceramic-paint-protection.jpg" },
  { slug: "exterior-glass-ceramic", file: "exterior-glass-ceramic-coating.jpg" },
  { slug: "engine-bay-detail", file: "engine-bay-detail.jpg" },
  { slug: "signature-detail", file: "signature-detail.jpg" },
  { slug: "signature-detail-glass-protection", file: "signature-detail-glass-protection.jpg" },
];

async function optimizeImage(buffer) {
  const sharp = (await import("sharp")).default;
  return sharp(buffer)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

async function uploadFile(folder, filename, filePath) {
  const raw = readFileSync(filePath);
  const optimized = await optimizeImage(raw);
  const storagePath = `${folder}/${filename}.jpg`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: optimized,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed for ${storagePath}: ${res.status} ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function updateServiceImage(slug, url) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/services?slug=eq.${slug}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ image_url: url }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update service ${slug}: ${await res.text()}`);
  }
}

async function updatePageSectionImages(mobileUrl, desktopUrl) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/page_sections?page_key=eq.about&section_key=eq.intro`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
    },
  );
  const rows = await res.json();
  if (!rows?.[0]) {
    console.log("No about intro section found, skipping page_sections update");
    return;
  }

  const content = { ...rows[0].content, mobileImage: mobileUrl, desktopImage: desktopUrl };
  const patch = await fetch(
    `${SUPABASE_URL}/rest/v1/page_sections?page_key=eq.about&section_key=eq.intro`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ content }),
    },
  );
  if (!patch.ok) {
    throw new Error(`Failed to update about intro: ${await patch.text()}`);
  }

  const heroRes = await fetch(
    `${SUPABASE_URL}/rest/v1/page_sections?page_key=eq.home&section_key=eq.hero`,
    { headers: { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY } },
  );
  const heroRows = await heroRes.json();
  if (heroRows?.[0]) {
    const heroContent = {
      ...heroRows[0].content,
      mobileImage: mobileUrl,
      desktopImage: desktopUrl,
    };
    await fetch(
      `${SUPABASE_URL}/rest/v1/page_sections?page_key=eq.home&section_key=eq.hero`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ content: heroContent }),
      },
    );
  }
}

async function main() {
  console.log("Migrating CMS assets to Supabase Storage...\n");

  for (const { slug, file } of SERVICE_IMAGES) {
    const filePath = join(publicDir, file);
    if (!existsSync(filePath)) {
      console.warn(`  SKIP ${file} (not found)`);
      continue;
    }
    const url = await uploadFile("services", slug, filePath);
    await updateServiceImage(slug, url);
    console.log(`  ✓ services/${slug}.jpg`);
  }

  const aboutMobile = join(publicDir, "about-page-mobile.jpg");
  const aboutDesktop = join(publicDir, "about-page.jpg");
  let mobileUrl = "";
  let desktopUrl = "";

  if (existsSync(aboutMobile)) {
    mobileUrl = await uploadFile("about", "about-page-mobile", aboutMobile);
    console.log("  ✓ about/about-page-mobile.jpg");
  }
  if (existsSync(aboutDesktop)) {
    desktopUrl = await uploadFile("about", "about-page", aboutDesktop);
    console.log("  ✓ about/about-page.jpg");
  }
  if (existsSync(aboutMobile)) {
    await uploadFile("hero", "hero-mobile", aboutMobile);
    console.log("  ✓ hero/hero-mobile.jpg");
  }
  if (existsSync(aboutDesktop)) {
    await uploadFile("hero", "hero-desktop", aboutDesktop);
    console.log("  ✓ hero/hero-desktop.jpg");
  }

  if (mobileUrl && desktopUrl) {
    await updatePageSectionImages(mobileUrl, desktopUrl);
    console.log("  ✓ Updated page_sections (about intro + home hero)");
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
