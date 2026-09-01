export type Service = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  features: string[];
  includedServices?: string[];
  note?: string;
  image: string;
  featured?: boolean;
  category?: "standard" | "bundle" | "protection";
};

export const services: Service[] = [
  {
    id: "premium-interior-deep-clean",
    title: "Premium Interior Deep Clean",
    slug: "premium-interior-deep-clean",
    shortDescription:
      "A professional deep clean tailored to your vehicle's interior materials, age and condition.",
    description:
      "A professional deep clean tailored to your vehicle's interior materials, age and condition.",
    features: [
      "Thorough interior vacuum",
      "Deep carpet & floor cleaning",
      "Upholstery cleaning where appropriate",
      "Plastics & interior trim cleaning & treatment",
      "Leather cleaning & conditioning where applicable",
      "Steam cleaning where suitable",
      "Detailed finishing",
      "Includes a complimentary basic exterior wash",
    ],
    note: "Vehicles with excessive soiling, heavy staining, pet hair, strong odours or requiring specialist treatment may incur an additional charge.",
    image: "/premium-interior-deep-clean.jpg",
    featured: true,
    category: "standard",
  },
  {
    id: "exterior-detail",
    title: "Exterior Detail",
    slug: "exterior-detail",
    shortDescription:
      "A thorough exterior refresh designed to safely clean, maintain and enhance your vehicle's appearance.",
    description:
      "A thorough exterior refresh designed to safely clean, maintain and enhance your vehicle's appearance.",
    features: [
      "Safe pre-wash & hand wash",
      "Deep wheel & rim cleaning",
      "Wheel arches & under-arches",
      "Exterior detailing & finishing",
    ],
    image: "/exterior-detail-v2.jpg",
    featured: true,
    category: "standard",
  },
  {
    id: "complete-detail",
    title: "Complete Detail",
    slug: "complete-detail",
    shortDescription:
      "Our complete interior and exterior refresh — the ideal choice for customers looking to thoroughly refresh the entire vehicle.",
    description:
      "Our complete interior and exterior refresh. The ideal choice for customers looking to thoroughly refresh the entire vehicle.",
    features: [],
    includedServices: ["Premium Interior Deep Clean", "Exterior Detail"],
    image: "/complete-detail.jpg",
    featured: true,
    category: "bundle",
  },
  {
    id: "paint-enhancement",
    title: "Paint Enhancement",
    slug: "paint-enhancement",
    shortDescription:
      "A more intensive exterior treatment designed to restore gloss, improve paint clarity and enhance the overall appearance of the paintwork.",
    description:
      "A more intensive exterior treatment designed to restore gloss, improve paint clarity and enhance the overall appearance of the paintwork.",
    features: [
      "Safe pre-wash & hand wash",
      "Deep wheel & rim cleaning",
      "Wheel arches & under-arches",
      "Iron & tar decontamination",
      "Clay bar treatment",
      "Machine paint enhancement",
    ],
    note: "Heavily scratched, oxidised or neglected paintwork requiring additional correction will be assessed and quoted separately.",
    image: "/paint-enhancement.jpg",
    featured: true,
    category: "standard",
  },
  {
    id: "complete-paint-enhancement",
    title: "Complete Paint Enhancement",
    slug: "complete-paint-enhancement",
    shortDescription:
      "The complete inside-and-out treatment — ideal for customers looking for a complete vehicle transformation.",
    description:
      "The complete inside-and-out treatment. Ideal for customers looking for a complete vehicle transformation.",
    features: [],
    includedServices: ["Paint Enhancement", "Premium Interior Deep Clean"],
    image: "/complete-paint-enhancement.jpg",
    category: "bundle",
  },
  {
    id: "premium-wax-protection",
    title: "Premium Wax Protection",
    slug: "premium-wax-protection",
    shortDescription:
      "Enhanced gloss, water repellency and up to 9 months of protection.",
    description:
      "Enhanced gloss, water repellency and up to 9 months of protection. Protection can be added to any suitable Paint Enhancement service.",
    features: [
      "Enhanced gloss finish",
      "Water repellency",
      "Up to 9 months of protection",
    ],
    image: "/premium-wax-protection.jpg",
    category: "protection",
  },
  {
    id: "ceramic-paint-protection",
    title: "1-Year Ceramic Paint Protection",
    slug: "ceramic-paint-protection",
    shortDescription:
      "Enhanced gloss, strong hydrophobic properties and long-lasting paint protection.",
    description:
      "Enhanced gloss, strong hydrophobic properties and long-lasting paint protection. Protection can be added to any suitable Paint Enhancement service.",
    features: [
      "Enhanced gloss finish",
      "Strong hydrophobic properties",
      "Long-lasting paint protection",
    ],
    image: "/ceramic-paint-protection.jpg",
    category: "protection",
  },
  {
    id: "exterior-glass-ceramic",
    title: "Exterior Glass Ceramic Coating",
    slug: "exterior-glass-ceramic",
    shortDescription:
      "Enhanced water repellency and improved visibility during wet conditions.",
    description:
      "Enhanced water repellency and improved visibility during wet conditions. Protection can be added to any suitable Paint Enhancement service.",
    features: [
      "Enhanced water repellency",
      "Improved visibility in wet conditions",
    ],
    image: "/exterior-glass-ceramic-coating.jpg",
    category: "protection",
  },
  {
    id: "engine-bay-detail",
    title: "Engine Bay Detail",
    slug: "engine-bay-detail",
    shortDescription:
      "A careful and detailed engine bay clean using appropriate products and techniques around sensitive components.",
    description:
      "A careful and detailed engine bay clean using appropriate products and techniques around sensitive components.",
    features: [
      "Safe degreasing",
      "Hand brush agitation",
      "Plastic & rubber dressing",
      "Protected electrical areas",
    ],
    image: "/engine-bay-detail.jpg",
    category: "standard",
  },
  {
    id: "signature-detail",
    title: "Signature Detail",
    slug: "signature-detail",
    shortDescription:
      "Our ultimate complete vehicle transformation — a complete inside-and-out detail finished with long-lasting ceramic protection.",
    description:
      "Our ultimate complete vehicle transformation. A complete inside-and-out detail finished with long-lasting ceramic protection.",
    features: [],
    includedServices: [
      "Paint Enhancement",
      "Premium Interior Deep Clean",
      "1-Year Ceramic Paint Protection",
    ],
    image: "/signature-detail.jpg",
    category: "bundle",
  },
  {
    id: "signature-detail-glass",
    title: "Signature Detail + Glass Protection",
    slug: "signature-detail-glass-protection",
    shortDescription:
      "Everything included in the Signature Detail, plus exterior glass ceramic coating — the ultimate inside-and-out detailing and protection package.",
    description:
      "Everything included in the Signature Detail, plus exterior glass ceramic coating. The ultimate inside-and-out detailing and protection package.",
    features: [],
    includedServices: [
      "Paint Enhancement",
      "Premium Interior Deep Clean",
      "1-Year Ceramic Paint Protection",
      "Exterior Glass Ceramic Coating",
    ],
    image: "/signature-detail-glass-protection.jpg",
    category: "bundle",
  },
];

export const paintProtectionIntro =
  "Protection can be added to any suitable Paint Enhancement service.";

export const pricingInformation = {
  title: "Important Pricing Information",
  paragraphs: [
    "Pricing varies depending on vehicle size, condition and individual requirements.",
    "Vehicles requiring additional labour due to heavy contamination, severe paint defects, excessive soiling, staining, pet hair, odours or specialist treatment may incur an additional charge.",
    "Classic, vintage and older vehicles, as well as vehicles with delicate or sensitive materials, will be assessed individually and treated using appropriate products and techniques.",
    "Any additional costs will always be discussed and agreed with the customer before work begins.",
    "Message us for a personalised quotation for your vehicle.",
  ],
};

export const featuredServices = services.filter((s) => s.featured);

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
