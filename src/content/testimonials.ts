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
    name: "Mark Attard",
    vehicle: "BMW M4",
    quote:
      "Absolutely blown away by the paint correction. Swirls I had for years are completely gone. QTM treated my car like their own.",
    rating: 5,
  },
  {
    id: "2",
    name: "Sarah Camilleri",
    vehicle: "Mercedes GLC",
    quote:
      "The ceramic coating has made washing so easy. Water just beads off. Professional team and spotless workshop.",
    rating: 5,
  },
  {
    id: "3",
    name: "James Borg",
    vehicle: "Porsche 911",
    quote:
      "Best detailing experience in Malta. Attention to detail is unmatched — interior smells brand new and paint depth is incredible.",
    rating: 5,
  },
  {
    id: "4",
    name: "Daniel Micallef",
    vehicle: "Audi RS6",
    quote:
      "Booked the Signature package before a track day. Car looked better than when I collected it from the dealer.",
    rating: 5,
  },
];
