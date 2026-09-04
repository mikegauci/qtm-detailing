export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  locale: string;
  currency: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    whatsappUrl: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  hours: { day: string; hours: string }[];
  social: {
    instagram: string;
    facebook: string;
  };
  nav: { label: string; href: string }[];
};

export type ServiceImage = {
  url: string;
  focalY: number;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  features: string[];
  includedServices?: string[];
  note?: string;
  titleSubline?: string;
  image: string;
  images: ServiceImage[];
  featured?: boolean;
  category?: "interior" | "exterior" | "protection" | "bundle";
};

export type Package = {
  id: string;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
  includes: boolean[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type GalleryCategory =
  | "all"
  | "exterior"
  | "interior"
  | "correction"
  | "coating";

export type GalleryPhotoCategory = Exclude<GalleryCategory, "all">;

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  photoType: "before" | "after";
  category: GalleryPhotoCategory;
  carName?: string;
  sortOrder: number;
};
