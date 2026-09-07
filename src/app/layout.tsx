import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-jsonld";
import { getTestimonials } from "@/lib/content/get-testimonials";
import { getSiteSettings } from "@/lib/content/get-site-settings";
import { getIndexingRobots } from "@/lib/seo/indexing";
import { getProductionSiteUrl } from "@/lib/seo/site-url";
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
  const baseUrl = getProductionSiteUrl(settings);
  const robots = await getIndexingRobots(settings);

  const metadata: Metadata = {
    metadataBase: new URL(`${baseUrl}/`),
    title: {
      default: `${settings.name} | Premium Automotive Detailing Malta`,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    keywords: settings.seo.keywords,
    openGraph: {
      type: "website",
      locale: settings.locale,
      url: baseUrl,
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
    robots,
  };

  if (settings.seo.googleSiteVerification) {
    metadata.verification = {
      ...metadata.verification,
      google: settings.seo.googleSiteVerification,
    };
  }

  if (settings.seo.bingSiteVerification) {
    metadata.verification = {
      ...metadata.verification,
      other: {
        ...metadata.verification?.other,
        "msvalidate.01": settings.seo.bingSiteVerification,
      },
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, testimonials] = await Promise.all([
    getSiteSettings(),
    getTestimonials(),
  ]);

  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <LocalBusinessJsonLd settings={settings} testimonials={testimonials} />
        {children}
      </body>
    </html>
  );
}
