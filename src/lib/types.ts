export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "lost",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export type ContactMethod = "phone" | "email" | "whatsapp";

export type MediaKind = "logo" | "hero" | "car" | "gallery" | "review" | "location" | "cta";

export type HeroSettings = {
  eyebrow: string;
  heading: string;
  highlightedHeading: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  featuredCarId: string | null;
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
  city: string;
  country: string;
  mapUrl: string;
  mapsSearch: string;
  openingHours: string;
  taxNumber: string;
};

export type FooterSettings = {
  agencyCredit: string;
  agencyUrl: string;
  copyrightLine: string;
};

export type WhySettings = {
  eyebrow: string;
  heading: string;
  description: string;
};

export type CtaSettings = {
  eyebrow: string;
  heading: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  backgroundImageId: string | null;
};

export type PricingSettings = {
  currencyCode: string;
  symbolPosition: "before" | "after";
};

export type SiteSettings = {
  hero: HeroSettings;
  seo: SeoSettings;
  tracking: TrackingSettings;
  contact: ContactSettings;
  why: WhySettings;
  cta: CtaSettings;
  footer: FooterSettings;
  pricing: PricingSettings;
};

export type LocationRecord = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  google_maps_url: string;
  maps_search: string;
  latitude: string;
  longitude: string;
  phone: string;
  image_id: string | null;
  opening_hours: string;
  active: number;
  primary_location: number;
  sort_order: number;
};

export type OverviewMetrics = {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  closedLeads: number;
};
