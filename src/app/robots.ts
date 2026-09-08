import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/server/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const siteUrl = settings.seo.canonicalUrl || "http://localhost:3000";

  return {
    rules: settings.seo.robots.startsWith("noindex")
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
