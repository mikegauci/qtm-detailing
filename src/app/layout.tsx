import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import { Toaster } from "@/components/ui/sonner";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-jsonld";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(settings.url),
    title: {
      default: `${settings.name} | Premium Automotive Detailing Malta`,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    keywords: [
      "car detailing Malta",
      "paint correction Malta",
      "ceramic coating Malta",
      "auto detailing Xemxija",
      "QTM Detailing",
    ],
    openGraph: {
      type: "website",
      locale: settings.locale,
      url: settings.url,
      siteName: settings.name,
      title: settings.name,
      description: settings.description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.name,
      description: settings.description,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <LocalBusinessJsonLd settings={settings} />
        <SiteChrome settings={settings}>{children}</SiteChrome>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
