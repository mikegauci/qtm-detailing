export type Testimonial = {
  id: string;
  name: string;
  vehicle: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Simon Cutajar",
    vehicle: "BMW 420D",
    quote:
      "Absolutely blown away by the paint correction. Swirls I had for years are completely gone. QTM Detailing treated my car like their own.",
    rating: 5,
  },
  {
    id: "2",
    name: "Roberta Gauci Attard",
    vehicle: "Audi A1",
    quote:
      "The ceramic coating has made washing so easy. Water just beads off. Professional team and spotless workshop.",
    rating: 5,
  },
  {
    id: "3",
    name: "Vince Bartolo",
    vehicle: "VW T-Roc",
    quote:
      "Best detailing experience in Malta. Attention to detail is unmatched — interior smells brand new and paint depth is incredible.",
    rating: 5,
  },
  {
    id: "4",
    name: "Erika Zammit Martins",
    vehicle: "Toyota C-HR",
    quote:
      "Booked the Signature package for my daily. Car looked better than when I collected it from the dealer.",
    rating: 5,
  },
];
