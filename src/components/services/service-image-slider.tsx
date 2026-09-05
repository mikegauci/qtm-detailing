"use client";

import { useEffect, useState, type ComponentType } from "react";
import Image from "next/image";
import { serviceImageStyle } from "@/lib/content/service-images";
import type { ServiceImage } from "@/types/content";
import { cn } from "@/lib/utils";

type ServiceImageSliderProps = {
  images: ServiceImage[];
  alt: string;
  className?: string;
};

function ServiceImageSliderFallback({
  images,
  alt,
  className,
}: ServiceImageSliderProps) {
  const image = images[0];

  if (!image) {
    return (
      <div
        className={cn(
          "relative flex aspect-[4/3] items-center justify-center bg-surface-raised",
          className,
        )}
      >
        <span className="text-sm text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden", className)}>
      <Image
        src={image.url}
        alt={alt}
        fill
        className="object-cover"
        style={serviceImageStyle(image)}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );
}

type InteractiveSliderProps = ServiceImageSliderProps;

export function ServiceImageSlider({
  images,
  alt,
  className,
}: ServiceImageSliderProps) {
  const [InteractiveSlider, setInteractiveSlider] = useState<
    ComponentType<InteractiveSliderProps> | null
  >(null);

  useEffect(() => {
    import("@/components/services/service-image-slider-interactive").then(
      (mod) => {
        setInteractiveSlider(() => mod.ServiceImageSliderInteractive);
      },
    );
  }, []);

  if (images.length <= 1) {
    return (
      <ServiceImageSliderFallback
        images={images}
        alt={alt}
        className={className}
      />
    );
  }

  if (!InteractiveSlider) {
    return (
      <ServiceImageSliderFallback
        images={images}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <InteractiveSlider images={images} alt={alt} className={className} />
  );
}

export { ServiceImageSliderFallback };
