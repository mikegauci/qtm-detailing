import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse QTM Detailing's portfolio — before and after transformations, paint correction, ceramic coating, and interior restoration in Malta.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
