import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/content/get-site-settings";

export const revalidate = 3600;

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Header settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
      <Toaster position="top-center" richColors />
    </>
  );
}
