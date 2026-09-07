import { Mail, MapPin, Phone, Clock } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import type { SectionHeadingContent } from "@/types/page-sections";
import { CTAButton, SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

type ContactPageContentProps = {
  settings: SiteConfig;
  hero: SectionHeadingContent;
};

export function ContactPageContent({ settings, hero }: ContactPageContentProps) {
  return (
    <section className="px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-32">
      <div className="container-narrow">
        <FadeIn>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
            <div>
              <SectionHeading
                eyebrow={hero.eyebrow}
                title={hero.title}
                description={hero.description}
                align="left"
                className="mb-6"
              />
              <CTAButton
                href={settings.contact.whatsappUrl}
                className="gap-2 px-8 py-4 text-base"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Message on WhatsApp
              </CTAButton>
            </div>

            <div className="glass-panel divide-y divide-border-subtle rounded-2xl">
              <div className="p-6 sm:p-7">
                <h3 className="mb-4 font-semibold">Get in touch</h3>
                <ul className="grid gap-4 sm:grid-cols-2">
                  <li className="flex items-start gap-3">
                    <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <a
                        href={settings.contact.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-[#25D366]"
                      >
                        {settings.contact.whatsapp}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                        className="font-medium hover:text-brand-purple-400"
                      >
                        {settings.contact.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${settings.contact.email}`}
                        className="font-medium hover:text-brand-cyan-400"
                      >
                        {settings.contact.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{settings.contact.address}</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 sm:p-7">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Clock className="h-5 w-5 text-brand-cyan-400" />
                  Opening Hours
                </h3>
                <ul className="space-y-2">
                  {settings.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between gap-4 text-sm text-muted-foreground"
                    >
                      <span>{h.day}</span>
                      <span className="text-right">{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
