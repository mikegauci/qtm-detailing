import { requireAdmin } from "@/lib/supabase/admin";
import { getDriveRootFolderName, isDriveConnected } from "@/lib/google-drive";
import { GalleryHub } from "@/components/admin/gallery-hub";
import { getGalleryPhotos } from "@/app/actions/admin/gallery";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const [photos, driveConnected] = await Promise.all([
    getGalleryPhotos(),
    isDriveConnected(),
  ]);
  const rootFolderName = getDriveRootFolderName();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="mt-1 text-white/60">
          Link photos from Google Drive, publish optimized images, and manage
          the public gallery.
        </p>
      </div>
      <GalleryHub
        initialPhotos={photos}
        driveConnected={driveConnected}
        rootFolderName={rootFolderName}
      />
    </div>
  );
}
