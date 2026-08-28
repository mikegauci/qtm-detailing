export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "how-long",
    question: "How long does a full detail take?",
    answer:
      "Times vary by service. An exterior detail takes 3–4 hours, while paint correction and ceramic coating can take 1–3 days. We'll confirm the timeline when you request a quote.",
  },
  {
    id: "mobile",
    question: "Do you offer mobile detailing?",
    answer:
      "We operate from our Birkirkara studio for the best results. Mobile services may be available for select packages — contact us to discuss.",
  },
  {
    id: "ceramic-vs-wax",
    question: "Is ceramic coating worth it in Malta's climate?",
    answer:
      "Absolutely. Malta's intense UV and coastal salt air are tough on paint. Ceramic coating provides long-lasting UV protection, hydrophobic properties, and makes maintenance washes much easier.",
  },
  {
    id: "paint-correction",
    question: "Will paint correction remove all scratches?",
    answer:
      "Paint correction removes the majority of swirls and light scratches. Deep scratches that penetrate the clear coat may require touch-up paint — we'll assess your paint during inspection.",
  },
  {
    id: "booking",
    question: "How do I book an appointment?",
    answer:
      "Fill out our contact form with your vehicle details and preferred service. We'll respond within 24 hours with availability and a personalised quote.",
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, bank transfer, and major credit/debit cards. A deposit may be required for multi-day services.",
  },
];
