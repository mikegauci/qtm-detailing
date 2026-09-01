export const siteConfig = {
  name: "QTM Detailing",
  tagline: "Premium automotive detailing in Malta",
  description:
    "QTM Detailing delivers showroom-grade paint correction, ceramic coating, and interior restoration across Malta. Precision, passion, and premium results.",
  url: "https://www.qtmdetailing.mt/",
  locale: "en_MT",
  currency: "EUR",
  contact: {
    email: "hello@qtmdetailing.mt",
    phone: "+356 9997 1101",
    whatsapp: "+356 9997 1101",
    address: "Xemxija, Malta",
    coordinates: {
      lat: 35.898,
      lng: 14.461,
    },
  },
  hours: [
    { day: "Monday – Friday", hours: "09:00 – 19:00" },
    { day: "Saturday", hours: "09:00 – 13:00" },
    { day: "Sunday", hours: "Closed" },
  ],
  social: {
    instagram: "https://instagram.com/qtm.detailing",
    facebook: "https://facebook.com/qtm.detailing",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
