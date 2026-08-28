export const siteConfig = {
  name: "QTM Detailing",
  tagline: "Premium automotive detailing in Malta",
  description:
    "QTM Detailing delivers showroom-grade paint correction, ceramic coating, and interior restoration across Malta. Precision, passion, and premium results.",
  url: "https://qtm-detailing.com",
  locale: "en_MT",
  currency: "EUR",
  contact: {
    email: "hello@qtm-detailing.com",
    phone: "+356 2123 4567",
    whatsapp: "+356 9900 1122",
    address: "Triq il-Industrija, Birkirkara, Malta",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3232.5!2d14.461!3d35.898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDUzJzUyLjgiTiAxNMKwMjcnMzkuNiJF!5e0!3m2!1sen!2smt!4v1700000000000",
    coordinates: {
      lat: 35.898,
      lng: 14.461,
    },
  },
  hours: [
    { day: "Monday – Friday", hours: "08:00 – 18:00" },
    { day: "Saturday", hours: "09:00 – 14:00" },
    { day: "Sunday", hours: "Closed" },
  ],
  social: {
    instagram: "https://instagram.com/qtm.detailing",
    facebook: "https://facebook.com/qtm.detailing",
    tiktok: "https://tiktok.com/@qtm.detailing",
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
