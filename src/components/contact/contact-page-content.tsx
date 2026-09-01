import { Mail, MapPin, Phone, Clock } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import type { SectionHeadingContent } from "@/types/page-sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/fade-in";
import { ContactForm } from "@/components/contact/contact-form";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

type ContactPageContentProps = {
  settings: SiteConfig;
  hero: SectionHeadingContent;
};

export function ContactPageContent({ settings, hero }: ContactPageContentProps) {
  return (
    <section className="section-padding pt-32">
      <div className="container-narrow">
        <FadeIn>
          <SectionHeading
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
          />
        </FadeIn>

        <div className="grid items-stretch gap-12 lg:grid-cols-5">
          <FadeIn delay={0.1} className="order-2 h-full lg:order-1 lg:col-span-3">
            <div className="glass-panel flex h-full flex-col rounded-2xl p-6 sm:p-8">
              <ContactForm />
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="order-1 lg:order-2 lg:col-span-2">
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="mb-4 font-semibold">Get in touch</h3>
                <ul className="space-y-4">
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

              <div className="glass-panel rounded-2xl p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Clock className="h-5 w-5 text-brand-cyan-400" />
                  Opening Hours
                </h3>
                <ul className="space-y-2">
                  {settings.hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>{h.day}</span>
                      <span>{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
