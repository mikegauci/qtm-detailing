export type Package = {
  id: string;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
  includes: boolean[];
};

export const comparisonFeatures = [
  "Exterior wash & protection",
  "Interior deep clean",
  "Paint enhancement / correction",
  "Engine bay detail",
  "Long-term ceramic protection",
];

export const packages: Package[] = [
  {
    id: "essential",
    name: "Essential",
    price: 149,
    description: "Perfect for regular maintenance and a refreshed look.",
    features: [
      "Exterior wash & protection",
      "Interior vacuum & wipe-down",
      "Glass inside & out",
      "Tyre dressing",
      "Light decontamination",
    ],
    includes: [true, false, false, false, false],
  },
  {
    id: "premium",
    name: "Premium",
    price: 349,
    description: "Our most popular package for a complete transformation.",
    popular: true,
    features: [
      "Full exterior detail",
      "Interior deep clean",
      "Single-stage paint enhancement",
      "Engine bay light clean",
      "Ceramic spray sealant (6 months)",
    ],
    includes: [true, true, true, true, false],
  },
  {
    id: "signature",
    name: "Signature",
    price: 799,
    description: "Showroom-grade correction and long-term protection.",
    features: [
      "Multi-stage paint correction",
      "Full interior restoration",
      "Ceramic coating (3 years)",
      "Engine bay detail",
      "Complimentary maintenance wash",
    ],
    includes: [true, true, true, true, true],
  },
];
