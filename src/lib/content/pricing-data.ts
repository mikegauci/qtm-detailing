export type PriceTier = {
  label: string;
  price: number;
};

export type PricingItem = {
  slug: string;
  title: string;
  description: string;
  tiers: PriceTier[];
  includes?: string[];
  note?: string;
  warning?: string;
};

export type PricingHero = {
  eyebrow: string;
  title: string;
  description: string;
};

export type PricingSectionIntro = {
  heading: string;
  intro: string;
};

export type PricingImportantInfo = {
  title: string;
  paragraphs: string[];
  bullets: string[];
  closingParagraphs: string[];
};

export const pricingHero: PricingHero = {
  eyebrow: "Premium Detailing Services & Pricing",
  title: "Starting rates by vehicle size",
  description:
    "Professional detailing tailored to your vehicle's size, condition, materials and individual requirements.",
};

export const corePricingItems: PricingItem[] = [
  {
    slug: "interior-deep-clean",
    title: "Premium Interior Deep Clean",
    description:
      "A professional deep clean tailored to your vehicle's interior materials, age and condition.",
    tiers: [
      { label: "Small (S)", price: 160 },
      { label: "Medium (M)", price: 205 },
      { label: "Large (L)", price: 250 },
    ],
    includes: [
      "Thorough interior vacuum",
      "Deep cleaning of carpets & floor areas",
      "Upholstery cleaning where appropriate",
      "Plastics & interior trim cleaning & treatment",
      "Leather cleaning & conditioning where applicable",
      "Steam cleaning where suitable",
      "Detailed finishing",
    ],
    note: "Includes a complimentary basic exterior wash, ensuring your vehicle leaves looking fresh inside and out.",
    warning:
      "Vehicles with excessive soiling, heavy staining, pet hair, strong odours or requiring specialist treatment may require additional time and incur an additional charge.",
  },
  {
    slug: "exterior-detail",
    title: "Exterior Detail",
    description:
      "A thorough exterior clean designed to safely refresh and maintain your vehicle's appearance.",
    tiers: [
      { label: "Small (S)", price: 150 },
      { label: "Medium (M)", price: 175 },
      { label: "Large (L)", price: 200 },
    ],
    includes: [
      "Safe pre-wash",
      "Professional hand wash",
      "Deep wheel & rim cleaning",
      "Wheel arches & under-arches",
      "Exterior cleaning",
      "Exterior detailing & finishing",
    ],
  },
  {
    slug: "complete-detail",
    title: "Complete Detail",
    description: "The complete inside-and-out refresh.",
    tiers: [
      { label: "Small (S)", price: 290 },
      { label: "Medium (M)", price: 360 },
      { label: "Large (L)", price: 430 },
    ],
    includes: ["Premium Interior Deep Clean", "Exterior Detail"],
    note: "Ideal for customers wanting their entire vehicle professionally cleaned and refreshed.",
  },
  {
    slug: "paint-enhancement",
    title: "Paint Enhancement",
    description:
      "A more intensive exterior treatment designed to improve gloss, clarity and the overall appearance of the paintwork.",
    tiers: [
      { label: "Small (S)", price: 450 },
      { label: "Medium (M)", price: 675 },
      { label: "Large (L)", price: 900 },
    ],
    includes: [
      "Safe pre-wash & hand wash",
      "Deep wheel & rim cleaning",
      "Wheel arches & under-arches",
      "Iron fallout removal",
      "Tar removal",
      "Clay bar treatment",
      "Machine paint enhancement",
      "Professional finishing",
    ],
    warning:
      "Paint condition varies significantly between vehicles. Heavily scratched, oxidised or neglected paintwork requiring additional correction will be assessed individually and quoted accordingly.",
  },
];

export const ceramicCoatingIntro: PricingSectionIntro = {
  heading: "Ceramic Coating Packages",
  intro: "Our ceramic coating packages include extensive preparation and paint correction before protection is applied.",
};

const ceramicIncludes = [
  "Full paint correction",
  "Wheel protection",
  "Front windscreen ceramic protection",
  "Rear windscreen ceramic protection",
  "Panoramic roof ceramic protection, where applicable",
];

export const ceramicPricingItems: PricingItem[] = [
  {
    slug: "ceramic-1-year",
    title: "1-Year Ceramic Coating",
    tiers: [
      { label: "Extra Small (XS)", price: 750 },
      { label: "Small (S)", price: 950 },
      { label: "Medium (M)", price: 1150 },
      { label: "Large (L)", price: 1250 },
    ],
    description: "",
    includes: [...ceramicIncludes, "1-Year Ceramic Paint Protection"],
  },
  {
    slug: "ceramic-3-year",
    title: "3-Year Ceramic Coating",
    tiers: [
      { label: "Extra Small (XS)", price: 900 },
      { label: "Small (S)", price: 1100 },
      { label: "Medium (M)", price: 1300 },
      { label: "Large (L)", price: 1400 },
    ],
    description: "",
    includes: [...ceramicIncludes, "3-Year Ceramic Paint Protection"],
  },
];

export const addonPricingItems: PricingItem[] = [
  {
    slug: "side-window-ceramic",
    title: "Optional Side Window Ceramic Protection",
    description: "Side windows can be protected as an additional service.",
    tiers: [
      { label: "Per side window", price: 40 },
      { label: "All 4 side windows", price: 160 },
    ],
  },
  {
    slug: "engine-bay-clean",
    title: "Engine Bay Clean",
    description:
      "A careful engine bay treatment using appropriate products and techniques around sensitive components.",
    tiers: [{ label: "From", price: 89 }],
    includes: [
      "Safe cleaning of the engine bay",
      "Removal of dirt, dust and built-up grime",
      "Cleaning of accessible areas and components",
      "Careful treatment around sensitive areas",
      "Detailed finishing",
    ],
  },
  {
    slug: "engine-bay-clean-protection",
    title: "Engine Bay Clean + Protection",
    description: "Everything included in the Engine Bay Clean, plus:",
    tiers: [{ label: "From", price: 110 }],
    includes: [
      "Protective coating applied to suitable surfaces",
      "Enhanced appearance and finish",
      "Additional protection to help maintain treated surfaces",
    ],
  },
];

export const pricingImportantInfo: PricingImportantInfo = {
  title: "Important Pricing Information",
  paragraphs: [
    "All prices shown are starting prices and are based on the vehicle's size, condition and individual requirements.",
    "Vehicle size classifications may vary depending on the vehicle's overall dimensions and type.",
    "Vehicles requiring additional labour due to:",
  ],
  bullets: [
    "Heavy contamination",
    "Severe paint defects",
    "Excessive soiling",
    "Heavy staining",
    "Pet hair",
    "Strong odours",
    "Excessive dirt",
    "Specialist treatment",
  ],
  closingParagraphs: [
    "may incur an additional charge.",
    "Classic, vintage and older vehicles, as well as vehicles with delicate or sensitive materials, will be assessed individually and treated using the most appropriate products and techniques.",
    "Any additional work or costs will always be discussed and agreed with the customer before work begins.",
    "For a personalised quotation, please send us your vehicle make, model and a few clear photos of its current condition.",
  ],
};
