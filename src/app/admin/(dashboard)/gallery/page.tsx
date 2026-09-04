import { Suspense } from "react";
import { requireAdmin } from "@/lib/supabase/admin";
import { getDriveRootFolderName, isDriveConnected } from "@/lib/google-drive";
import { GalleryHubLazy } from "@/components/admin/lazy/gallery-hub-lazy";
import { getGalleryPhotos } from "@/app/actions/admin/gallery";

export const maxDuration = 300;

type AdminGalleryPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminGalleryPage({
  searchParams,
}: AdminGalleryPageProps) {
  const { supabase } = await requireAdmin();
  const [{ view }, photos, driveConnected] = await Promise.all([
    searchParams,
    getGalleryPhotos(supabase),
    isDriveConnected(),
  ]);
  const rootFolderName = getDriveRootFolderName();
  const initialView = view === "linked" ? "linked" : "drive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Gallery</h1>
        <p className="mt-1 text-sm text-white/60 sm:text-base">
          {initialView === "linked"
            ? "Manage linked photos, filter by vehicle, and publish to the public gallery."
            : "Link photos from Google Drive, publish optimized images, and manage the public gallery."}
        </p>
      </div>
      <Suspense fallback={null}>
        <GalleryHubLazy
          initialPhotos={photos}
          driveConnected={driveConnected}
          rootFolderName={rootFolderName}
          initialView={initialView}
        />
      </Suspense>
    </div>
  );
}
