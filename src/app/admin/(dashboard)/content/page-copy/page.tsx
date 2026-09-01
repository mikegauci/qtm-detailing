import { requireAdmin } from "@/lib/supabase/admin";
import { getAdminPageSections } from "@/app/actions/admin/cms";
import {
  PageCopyEditor,
  type CtaBandContent,
  type HeroContent,
  type WhyQtmContent,
} from "@/components/admin/page-copy-editor";

const defaultHero: HeroContent = {
  eyebrow: "Malta's Premium Detailing Studio",
  titleLine1: "Showroom-grade",
  titleLine2: "detailing for every drive",
  description:
    "Paint correction, ceramic coating, and interior restoration, crafted with precision for Malta's most discerning drivers.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "View Services", href: "/services" },
  mobileImage: "/about-page-mobile.jpg",
  desktopImage: "/about-page.jpg",
};

const defaultWhyQtm: WhyQtmContent = {
  eyebrow: "Why QTM Detailing",
  title: "Obsessive detail. Lasting results.",
  description:
    "We don't rush. Every vehicle gets a personalised treatment plan based on its condition, paint type, and your expectations.",
  reasons: [
    {
      title: "Studio-grade equipment",
      description:
        "Dual-action and rotary polishers, steam extractors, and IR curing — the same tools used in professional body shops.",
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

const defaultCta: CtaBandContent = {
  title: "Ready for showroom results?",
  description:
    "Request a free quote and we'll get back within 24 hours with availability and personalised pricing for your vehicle.",
  primaryCta: { label: "Request a Quote", href: "/contact" },
  secondaryCta: { label: "Explore Services", href: "/services" },
};

export default async function PageCopyAdminPage() {
  await requireAdmin();
  const sections = await getAdminPageSections();

  const hero =
    (sections.find((s) => s.section_key === "hero")?.content as HeroContent) ??
    defaultHero;
  const whyQtm =
    (sections.find((s) => s.section_key === "why-qtm")
      ?.content as WhyQtmContent) ?? defaultWhyQtm;
  const ctaBand =
    (sections.find((s) => s.section_key === "cta-band")
      ?.content as CtaBandContent) ?? defaultCta;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Page Copy</h1>
        <p className="mt-1 text-white/60">
          Edit homepage hero, why QTM, and CTA band content.
        </p>
      </div>
      <PageCopyEditor hero={hero} whyQtm={whyQtm} ctaBand={ctaBand} />
    </div>
  );
}
