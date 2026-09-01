"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  Folder,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  deletePhoto,
  findDriveRootFolder,
  getGalleryPhotos,
  linkDrivePhoto,
  listDriveFolders,
  listDriveImages,
  publishPhoto,
  unpublishPhoto,
} from "@/app/actions/admin/gallery";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type DriveFolder = { id: string; name: string };
type DriveImage = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
};

function DriveThumbnail({ fileId, name }: { fileId: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/10">
        <ImageIcon className="h-5 w-5 text-white/40" />
      </div>
    );
  }

  return (
    <img
      src={`/api/google-drive/thumbnail/${fileId}`}
      alt={name}
      loading="lazy"
      className="h-12 w-12 shrink-0 rounded object-cover bg-white/10"
      onError={() => setFailed(true)}
    />
  );
}

type GalleryHubProps = {
  initialPhotos: Tables<"job_photos">[];
  driveConnected: boolean;
  rootFolderName?: string;
};

export function GalleryHub({
  initialPhotos,
  driveConnected,
  rootFolderName = "QTM Detailing",
}: GalleryHubProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [images, setImages] = useState<DriveImage[]>([]);
  const [folderStack, setFolderStack] = useState<DriveFolder[]>([]);
  const [selectedImage, setSelectedImage] = useState<DriveImage | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("exterior");
  const [photoType, setPhotoType] = useState<"before" | "after">("before");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingDrive, setLoadingDrive] = useState(false);
  const initializedRef = useRef(false);

  const currentFolder = folderStack[folderStack.length - 1];

  const loadFolderContents = useCallback(async (stack: DriveFolder[]) => {
    setLoadingDrive(true);
    try {
      const folder = stack[stack.length - 1];
      const parentId = folder?.id;

      const [childFolders, folderImages] = await Promise.all([
        listDriveFolders(parentId),
        parentId ? listDriveImages(parentId) : Promise.resolve([]),
      ]);

      setFolders(childFolders);
      setImages(folderImages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load folder");
    } finally {
      setLoadingDrive(false);
    }
  }, []);

  const openFolder = useCallback(
    async (folder: DriveFolder, stack?: DriveFolder[]) => {
      const nextStack = stack ?? [...folderStack, folder];
      setFolderStack(nextStack);
      setSelectedImage(null);
      await loadFolderContents(nextStack);
    },
    [folderStack, loadFolderContents],
  );

  const goBack = async () => {
    if (folderStack.length <= 1) return;
    const nextStack = folderStack.slice(0, -1);
    setFolderStack(nextStack);
    setSelectedImage(null);
    await loadFolderContents(nextStack);
  };

  const canGoBack = folderStack.length > 1;

  useEffect(() => {
    if (!driveConnected || initializedRef.current) return;

    initializedRef.current = true;

    void (async () => {
      setLoadingDrive(true);
      try {
        const rootFolder = await findDriveRootFolder();
        if (rootFolder) {
          setFolderStack([rootFolder]);
          const [childFolders, folderImages] = await Promise.all([
            listDriveFolders(rootFolder.id),
            listDriveImages(rootFolder.id),
          ]);
          setFolders(childFolders);
          setImages(folderImages);
        } else {
          const rootFolders = await listDriveFolders();
          setFolders(rootFolders);
          setImages([]);
          toast.message(`"${rootFolderName}" folder not found — showing Drive root.`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load Google Drive",
        );
      } finally {
        setLoadingDrive(false);
      }
    })();
  }, [driveConnected, rootFolderName]);

  const refreshPhotos = () => {
    startTransition(async () => {
      const next = await getGalleryPhotos();
      setPhotos(next);
    });
  };

  const handleLink = () => {
    if (!selectedImage || !currentFolder || !title.trim()) {
      toast.error("Select an image, folder, and enter a title.");
      return;
    }

    startTransition(async () => {
      const result = await linkDrivePhoto({
        driveFileId: selectedImage.id,
        driveFolderId: currentFolder.id,
        photoType,
        title: title.trim(),
        category,
        description: description.trim() || undefined,
      });
      if (result.success) {
        toast.success(result.message);
        setSelectedImage(null);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handlePublish = (photoId: string) => {
    startTransition(async () => {
      const result = await publishPhoto(photoId);
      if (result.success) {
        toast.success(result.message);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUnpublish = (photoId: string) => {
    startTransition(async () => {
      const result = await unpublishPhoto(photoId);
      if (result.success) {
        toast.success(result.message);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (photoId: string) => {
    if (!confirm("Delete this photo permanently?")) return;
    startTransition(async () => {
      const result = await deletePhoto(photoId);
      if (result.success) {
        toast.success(result.message);
        refreshPhotos();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5 rounded-xl border border-white/10 bg-surface-raised/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Google Drive Browser</h2>
          {!driveConnected && (
            <Button asChild size="sm">
              <a href="/api/google-drive/auth">Connect Drive</a>
            </Button>
          )}
        </div>

        {!driveConnected ? (
          <p className="text-sm text-white/60">
            Connect Google Drive in Settings to browse and link photos.
          </p>
        ) : (
          <>
            {canGoBack && (
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              </div>
            )}

            {folderStack.length > 0 && (
              <p className="mb-4 text-sm text-white/60">
                {folderStack.map((folder) => folder.name).join(" / ")}
              </p>
            )}

            {loadingDrive ? (
              <div className="flex items-center gap-2 py-6 text-sm text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => openFolder(folder)}
                    className="flex min-h-12 w-full items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5"
                  >
                    <Folder className="h-5 w-5 shrink-0 text-brand-cyan-400" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}
                {currentFolder &&
                  images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        selectedImage?.id === image.id
                          ? "border-brand-purple-400 bg-brand-purple-400/10"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      <DriveThumbnail fileId={image.id} name={image.name} />
                      <span className="truncate">{image.name}</span>
                    </button>
                  ))}
                {folders.length === 0 && images.length === 0 && (
                  <p className="py-6 text-center text-sm text-white/50">
                    This folder is empty.
                  </p>
                )}
              </div>
            )}

            {selectedImage && currentFolder && (
              <div className="space-y-4 border-t border-white/10 pt-5">
                <p className="text-sm text-white/70">
                  Link <strong>{selectedImage.name}</strong>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="title">Title (pair before/after by title)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Paint Enhancement"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={photoType}
                      onValueChange={(v) =>
                        setPhotoType(v as "before" | "after")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exterior">Exterior</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                        <SelectItem value="correction">Correction</SelectItem>
                        <SelectItem value="coating">Coating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleLink} disabled={isPending}>
                  Link Photo
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-5 rounded-xl border border-white/10 bg-surface-raised/40 p-6">
        <h2 className="text-lg font-semibold">Linked Photos</h2>
        {photos.length === 0 ? (
          <p className="text-sm text-white/60">No photos linked yet.</p>
        ) : (
          <div className="space-y-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="flex flex-col gap-4 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{photo.title ?? "Untitled"}</p>
                  <p className="mt-1 text-sm text-white/60">
                    {photo.photo_type} · {photo.category}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">
                      {photo.publish_to_gallery ? "Published" : "Draft"}
                    </Badge>
                    {photo.drive_file_id && (
                      <Badge variant="outline">Drive linked</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!photo.publish_to_gallery && photo.drive_file_id && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(photo.id)}
                      disabled={isPending}
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Publish
                    </Button>
                  )}
                  {photo.publish_to_gallery && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnpublish(photo.id)}
                      disabled={isPending}
                    >
                      <EyeOff className="mr-1 h-3 w-3" />
                      Unpublish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(photo.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
