import type { SiteConfig } from "@/types/content";
import type {
  AboutIntroContent,
  CtaBandContent,
  HeroContent,
  PricingInfoContent,
  ProcessStepsContent,
  SectionHeadingContent,
  WhyQtmContent,
} from "@/types/page-sections";

export const defaultSiteConfig: SiteConfig = {
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
    whatsappUrl: "https://wa.link/lvy8rn",
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
};

export const defaultHero: HeroContent = {
  eyebrow: "Malta's Premium Detailing Studio",
  titleLine1: "Showroom-grade",
  titleLine2: "detailing for every drive",
  description:
    "Paint correction, ceramic coating, and interior restoration, crafted with precision for Malta's most discerning drivers.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "View Services", href: "/services" },
  mobileImage: "",
  desktopImage: "",
};

export const defaultWhyQtm: WhyQtmContent = {
  eyebrow: "Why QTM Detailing",
  title: "Obsessive detail. Lasting results.",
  description:
    "We don't rush. Every vehicle gets a personalised treatment plan based on its condition, paint type, and your expectations.",
  reasons: [
    {
      title: "Professional-grade equipment",
      description:
        "We use carefully selected professional equipment, including dual-action and rotary polishers, steam and extraction equipment, and safe air blowers for touch-free drying — helping us achieve excellent results while treating every vehicle with care.",
    },
    {
      title: "OEM-safe products",
      description:
        "We use Gyeon, Koch Chemie, and CarPro — premium brands trusted by manufacturers worldwide.",
    },
    {
      title: "Transparent process",
      description:
        "Before-and-after documentation, paint depth readings, and clear pricing with no hidden fees.",
    },
    {
      title: "Malta climate expertise",
      description:
        "Coatings and sealants selected specifically for intense UV exposure and coastal salt air.",
    },
  ],
};

export const defaultCtaBand: CtaBandContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export const defaultFeaturedServicesHeading: SectionHeadingContent = {
  eyebrow: "Our Services",
  title: "Precision detailing, tailored to you",
  description:
    "From daily drivers to supercars, every vehicle receives the same obsessive attention to detail.",
};

export const defaultServicesHero: SectionHeadingContent = {
  eyebrow: "Premium Detailing Services",
  title: "Every detail, perfected",
  description:
    "Professional automotive detailing services tailored to your vehicle's needs.",
};

export const defaultFaqHeading: SectionHeadingContent = {
  eyebrow: "FAQ",
  title: "Common questions",
  description: "Everything you need to know before booking.",
};

export const defaultPricingInfo: PricingInfoContent = {
  title: "Important Pricing Information",
  paragraphs: [
    "Pricing varies depending on vehicle size, condition and individual requirements.",
    "Vehicles requiring additional labour due to heavy contamination, severe paint defects, excessive soiling, staining, pet hair, odours or specialist treatment may incur an additional charge.",
    "Classic, vintage and older vehicles, as well as vehicles with delicate or sensitive materials, will be assessed individually and treated using appropriate products and techniques.",
    "Any additional costs will always be discussed and agreed with the customer before work begins.",
    "Message us for a personalised quotation for your vehicle.",
  ],
};

export const defaultAboutIntro: AboutIntroContent = {
  eyebrow: "About QTM Detailing",
  title: "Passion for perfection",
  description:
    "Founded with a simple mission: deliver showroom-grade results that last. Every vehicle that enters our studio receives the same obsessive attention, whether it's a daily commuter or a weekend supercar.",
  mission:
    'QTM stands for Quad Tang Muto, meaning "What I touch, I change." Our team combines years of experience in automotive care with continuous training on the latest products and techniques. We believe detailing is a craft, and your car deserves nothing less than mastery.',
  mobileImage: "",
  desktopImage: "",
};

export const defaultProcessSteps: ProcessStepsContent = {
  eyebrow: "Our Process",
  title: "Four steps to showroom finish",
  description:
    "A transparent, repeatable process that delivers consistent results every time.",
  steps: [
    {
      step: "01",
      title: "Consultation",
      description:
        "We inspect your vehicle, discuss your goals, and recommend the right services for your budget and timeline.",
    },
    {
      step: "02",
      title: "Preparation",
      description:
        "Thorough wash, decontamination, and paint depth measurement ensure we start with a clean, assessed surface.",
    },
    {
      step: "03",
      title: "Treatment",
      description:
        "Our technicians apply correction, coating, or interior services using studio-grade equipment and premium products.",
    },
    {
      step: "04",
      title: "Inspection",
      description:
        "Final quality check under dedicated lighting. We walk you through the results and provide aftercare guidance.",
    },
  ],
};

export const defaultContactHero: SectionHeadingContent = {
  eyebrow: "Contact",
  title: "Request a quote",
  description:
    "Tell us about your vehicle and the services you're interested in. WhatsApp is the fastest way to reach us — or use the form below and we'll get back within 24 hours.",
};

export const defaultGalleryHero: SectionHeadingContent = {
  eyebrow: "Gallery",
  title: "Our latest work",
  description:
    "Real transformations straight from our studio. Click any photo to view it full size.",
};
