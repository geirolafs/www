import type { Metadata } from "next";
import { TrustPage } from "@/components/shell/trust-page";
import { siteConfig } from "@/lib/config/site";
import { contactContent } from "@/lib/content/trust";

export const metadata: Metadata = {
  title: contactContent.title,
  description: contactContent.description,
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
};

export default function Page() {
  return <TrustPage content={contactContent} />;
}
