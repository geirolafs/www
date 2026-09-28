import type { Metadata } from "next";
import { TrustPage } from "@/components/shell/trust-page";
import { siteConfig } from "@/lib/config/site";
import { aboutContent } from "@/lib/content/trust";

export const metadata: Metadata = {
  title: aboutContent.title,
  description: aboutContent.description,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default function Page() {
  return <TrustPage content={aboutContent} />;
}
