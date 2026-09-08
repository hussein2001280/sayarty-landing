export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type ContactMethod = "phone" | "email" | "whatsapp";

export type MediaKind = "logo" | "hero" | "car" | "gallery" | "review" | "location";

export type HeroSettings = {
  eyebrow: string;
  heading: string;
  highlightedHeading: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  heroImageId: string | null;
  heroImageAlt: string;
  active: boolean;
};

export type SeoSettings = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  ogImageId: string | null;
  robots: string;
};

export type TrackingSettings = {
  gtmId: string;
  ga4Id: string;
  googleAdsConversionId: string;
  googleAdsConversionLabel: string;
};

export type ContactSettings = {
  tradingName: string;
  legalName: string;
  description: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  address: string;
  mapUrl: string;
  openingHours: string;
  taxNumber: string;
};

export type FooterSettings = {
  agencyCredit: string;
  copyrightLine: string;
};

export type SiteSettings = {
  hero: HeroSettings;
  seo: SeoSettings;
  tracking: TrackingSettings;
  contact: ContactSettings;
  footer: FooterSettings;
};

export type OverviewMetrics = {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  closedLeads: number;
};
