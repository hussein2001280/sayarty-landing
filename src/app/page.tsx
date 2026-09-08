import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { getLandingData } from "@/lib/server/content";

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
  return <LandingPage {...data} />;
}
