import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
