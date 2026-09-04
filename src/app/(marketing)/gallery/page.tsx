import { Suspense } from "react";
import type { Metadata } from "next";
import { CtaBand } from "@/components/sections/cta-band";
import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import { defaultCtaBand, defaultGalleryHero } from "@/lib/content/cms-defaults";
import {
  filterGalleryPhotos,
  getGalleryCarNames,
  parseGalleryFilters,
  type GalleryFilterParams,
} from "@/lib/content/gallery-filters";
import { getGalleryPhotos } from "@/lib/content/get-gallery";
import { getPageSections } from "@/lib/content/get-page-section";
import {
  getGalleryPageCount,
  paginatePhotos,
} from "@/lib/content/gallery-photo-utils";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse QTM Detailing's portfolio — before and after transformations, paint correction, ceramic coating, and interior restoration in Malta.",
};

export const revalidate = 3600;

type GalleryPageProps = {
  searchParams: Promise<GalleryFilterParams>;
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const filters = parseGalleryFilters(params);

  const [allPhotos, gallerySections, homeSections] = await Promise.all([
    getGalleryPhotos(),
    getPageSections("gallery", {
      hero: defaultGalleryHero,
    }),
    getPageSections("home", {
      "cta-band": defaultCtaBand,
    }),
  ]);

  const filteredPhotos = filterGalleryPhotos(allPhotos, filters);
  const filteredCount = filteredPhotos.length;
  const totalPages = getGalleryPageCount(filteredCount);
  const currentPage = Math.min(filters.currentPage, totalPages);
  const paginatedPhotos = paginatePhotos(filteredPhotos, currentPage);
  const carNames = getGalleryCarNames(allPhotos, filters.category);

  return (
    <>
      <Suspense fallback={null}>
        <GalleryPageContent
          photos={paginatedPhotos}
          filteredCount={filteredCount}
          carNames={carNames}
          filters={filters}
          totalPages={totalPages}
          currentPage={currentPage}
          hero={gallerySections.hero}
        />
      </Suspense>
      <CtaBand content={homeSections["cta-band"]} />
    </>
  );
}
