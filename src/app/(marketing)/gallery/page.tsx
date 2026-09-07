import { Suspense } from "react";
import { CtaBand } from "@/components/sections/cta-band";
import { GalleryPageContent } from "@/components/gallery/gallery-page-content";
import {
  defaultCtaBand,
  defaultGalleryHero,
  defaultGallerySeo,
} from "@/lib/content/cms-defaults";
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
import { getMarketingPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  return getMarketingPageMetadata({
    pageKey: "gallery",
    path: "/gallery",
    defaultSeo: defaultGallerySeo,
    canonicalPath: "/gallery",
  });
}

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
