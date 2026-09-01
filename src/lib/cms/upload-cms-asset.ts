import sharp from "sharp";

export const CMS_ASSETS_BUCKET = "cms-assets";

export async function optimizeCmsImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

export function cmsAssetStoragePath(folder: string, filename: string): string {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const safeName = filename.replace(/[^a-z0-9.-]/gi, "").toLowerCase();
  return `${safeFolder}/${safeName}`;
}
