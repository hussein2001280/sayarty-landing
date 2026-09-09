import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { buildLocalBusinessJsonLd } from "@/lib/business";
import { getLandingData } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLandingData();

  return {
    title: data.settings.seo.title,
    description: data.settings.seo.description,
    alternates: data.settings.seo.canonicalUrl
      ? { canonical: data.settings.seo.canonicalUrl }
      : undefined,
    robots: data.settings.seo.robots,
    openGraph: {
      title: data.settings.seo.ogTitle,
      description: data.settings.seo.ogDescription,
      images: data.ogMedia?.data_uri ? [data.ogMedia.data_uri] : undefined,
    },
  };
}

export default async function Home() {
  const data = await getLandingData();
  const jsonLd = buildLocalBusinessJsonLd(data.settings);

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage {...data} />
    </section>
  );
}
