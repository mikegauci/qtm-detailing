"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { SiteConfig } from "@/types/content";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/ui/section-heading";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header({ settings }: { settings: SiteConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-panel border-b py-3 shadow-lg shadow-black/20"
          : "bg-transparent py-5",
      )}
    >
      <div className="container-narrow flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <Image
            src="/qtm-logo.png"
            alt="QTM Detailing"
            width={140}
            height={48}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {settings.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <CTAButton href="/contact">Get a Quote</CTAButton>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="glass-panel w-full max-w-sm border-l border-border-subtle bg-surface-base px-6 pb-8 pt-14"
          >
            <SheetHeader className="p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {settings.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-brand-purple-400"
                >
                  {item.label}
                </Link>
              ))}
              <CTAButton
                href="/contact"
                className="mt-4 w-full"
                onClick={() => setOpen(false)}
              >
                Get a Quote
              </CTAButton>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
