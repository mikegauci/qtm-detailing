export type Service = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceFrom: number;
  duration: string;
  features: string[];
  image: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    id: "exterior-detailing",
    title: "Exterior Detailing",
    slug: "exterior-detailing",
    shortDescription: "Deep wash, decontamination, and paint-safe finishing for a mirror-like shine.",
    description:
      "Our signature exterior detail removes bonded contaminants, restores clarity, and finishes with premium sealants for lasting protection against Malta's sun and salt air.",
    priceFrom: 89,
    duration: "3–4 hours",
    features: [
      "Multi-stage safe wash",
      "Iron & tar decontamination",
      "Clay bar treatment",
      "Machine polish finish",
      "Tyre & trim dressing",
    ],
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    featured: true,
  },
  {
    id: "paint-correction",
    title: "Paint Correction",
    slug: "paint-correction",
    shortDescription: "Remove swirls, scratches, and oxidation for a flawless, deep gloss finish.",
    description:
      "Multi-stage machine polishing eliminates years of wash marks and environmental damage, revealing the true depth and colour of your paintwork.",
    priceFrom: 249,
    duration: "1–2 days",
    features: [
      "Paint depth measurement",
      "Multi-stage compound & refine",
      "Swirl & scratch removal",
      "Hologram-free finish",
      "Paint inspection report",
    ],
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
    featured: true,
  },
  {
    id: "ceramic-coating",
    title: "Ceramic Coating",
    slug: "ceramic-coating",
    shortDescription: "Long-lasting hydrophobic protection with extreme gloss and UV resistance.",
    description:
      "Professional-grade ceramic coating bonds to your paint for years of protection, making maintenance washes effortless and keeping your vehicle looking showroom fresh.",
    priceFrom: 449,
    duration: "2–3 days",
    features: [
      "Full paint preparation",
      "9H ceramic application",
      "Hydrophobic top coat",
      "Up to 5-year warranty",
      "Aftercare kit included",
    ],
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80",
    featured: true,
  },
  {
    id: "interior-detailing",
    title: "Interior Deep Clean",
    slug: "interior-detailing",
    shortDescription: "Steam extraction, leather conditioning, and odour elimination throughout.",
    description:
      "From leather seats to headliners, we restore every surface with OEM-safe products — perfect for daily drivers and prestige vehicles alike.",
    priceFrom: 119,
    duration: "4–6 hours",
    features: [
      "Full vacuum & steam clean",
      "Leather clean & condition",
      "Fabric extraction",
      "Dashboard & trim detail",
      "Odour neutralisation",
    ],
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80",
    featured: true,
  },
  {
    id: "headlight-restoration",
    title: "Headlight Restoration",
    slug: "headlight-restoration",
    shortDescription: "Restore clarity and UV protection to faded, yellowed headlights.",
    description:
      "Improve visibility and the overall look of your vehicle with professional headlight restoration and a durable UV-resistant sealant.",
    priceFrom: 69,
    duration: "1–2 hours",
    features: [
      "Sand & polish process",
      "UV yellowing removal",
      "Clarity restoration",
      "UV sealant application",
      "Same-day service",
    ],
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
  },
  {
    id: "engine-bay",
    title: "Engine Bay Detail",
    slug: "engine-bay",
    shortDescription: "Safe degreasing and dressing for a factory-fresh engine bay.",
    description:
      "Meticulous engine bay cleaning using water-safe techniques and premium dressings — ideal before sale or show events.",
    priceFrom: 79,
    duration: "2–3 hours",
    features: [
      "Safe degreasing",
      "Hand brush agitation",
      "Plastic & rubber dressing",
      "Protected electrical areas",
      "Show-ready finish",
    ],
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
  },
];

export const featuredServices = services.filter((s) => s.featured);

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
