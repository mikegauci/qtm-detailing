"use client";

import dynamic from "next/dynamic";
import type { ComponentProps, ComponentType } from "react";
import { EditorLoading } from "@/components/admin/lazy/editor-loading";

export function createLazyComponent<P extends object>(
  importFn: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string,
  label: string,
) {
  const LazyComponent = dynamic(
    () => importFn().then((mod) => mod[exportName]),
    { loading: () => <EditorLoading label={label} /> },
  );

  return function LazyWrapper(props: ComponentProps<ComponentType<P>>) {
    return <LazyComponent {...props} />;
  };
}
