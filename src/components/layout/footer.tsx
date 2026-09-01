import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export function Footer({ settings }: { settings: SiteConfig }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface-raised/50">
      <div className="container-narrow section-padding pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Image
              src="/qtm-logo.png"
              alt="QTM Detailing"
              width={120}
              height={40}
              className="mb-4 h-10 w-auto"
            />
            <p className="max-w-sm text-muted-foreground">
              {settings.description}
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={settings.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-brand-purple-400 hover:text-brand-purple-400"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={settings.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-muted-foreground transition-colors hover:border-brand-cyan-400 hover:text-brand-cyan-400"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {settings.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href={settings.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#25D366]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${settings.contact.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-foreground"
                >
                  {settings.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {settings.contact.email}
                </a>
              </li>
              <li>{settings.contact.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {settings.name}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Premium automotive detailing · Malta
          </p>
        </div>
      </div>
    </footer>
  );
}
