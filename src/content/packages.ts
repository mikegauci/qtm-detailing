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
  "Premium Interior Deep Clean",
  "Exterior Detail",
  "Paint Enhancement",
  "1-Year Ceramic Paint Protection",
  "Exterior Glass Ceramic Coating",
];

export const packages: Package[] = [
  {
    id: "complete-detail",
    name: "Complete Detail",
    price: 289,
    description:
      "Our complete interior and exterior refresh — ideal for thoroughly refreshing the entire vehicle.",
    features: [
      "Premium Interior Deep Clean",
      "Exterior Detail",
      "Complimentary basic exterior wash included with interior",
    ],
    includes: [true, true, false, false, false],
  },
  {
    id: "complete-paint-enhancement",
    name: "Complete Paint Enhancement",
    price: 419,
    description:
      "The complete inside-and-out treatment for a full vehicle transformation.",
    features: [
      "Paint Enhancement",
      "Premium Interior Deep Clean",
      "Machine paint enhancement & decontamination",
    ],
    includes: [true, false, true, false, false],
  },
  {
    id: "signature-detail",
    name: "Signature Detail",
    price: 599,
    description:
      "Our ultimate complete vehicle transformation with long-lasting ceramic protection.",
    popular: true,
    features: [
      "Paint Enhancement",
      "Premium Interior Deep Clean",
      "1-Year Ceramic Paint Protection",
    ],
    includes: [true, false, true, true, false],
  },
  {
    id: "signature-detail-glass",
    name: "Signature Detail + Glass",
    price: 669,
    description:
      "Everything in the Signature Detail, plus exterior glass ceramic coating.",
    features: [
      "Paint Enhancement",
      "Premium Interior Deep Clean",
      "1-Year Ceramic Paint Protection",
      "Exterior Glass Ceramic Coating",
    ],
    includes: [true, false, true, true, true],
  },
];
