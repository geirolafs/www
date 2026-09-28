import type { Metadata } from "next";
import { TrustPage } from "@/components/shell/trust-page";
import { siteConfig } from "@/lib/config/site";
import { privacyContent } from "@/lib/content/trust";

export const metadata: Metadata = {
  title: privacyContent.title,
  description: privacyContent.description,
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function Page() {
  return <TrustPage content={privacyContent} />;
}
