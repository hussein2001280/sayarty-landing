export const SAYARTY_BUSINESS = {
  brand: "SAYARTY",
  name: "Sayarty Online",
  phone: "+971 502800309",
  whatsappDisplay: "+971 502800309",
  whatsappNumber: "971502800309",
  country: "United Arab Emirates",
  city: "Dubai",
  address: "46PH+6W Dubai, United Arab Emirates",
  mapsSearch: "46PH+6W Dubai, United Arab Emirates",
  taxNumberPlaceholder: "TAX NUMBER TO BE ADDED",
  agencyName: "Trendify Agency",
  agencyUrl: "https://trendifyegypt.com",
} as const;

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(number: string, message?: string) {
  const normalized = normalizeWhatsAppNumber(number);
  if (!normalized) {
    return "";
  }

  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telHref(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  return compact ? `tel:${compact}` : "";
}

export function carDisplayName(car: {
  display_name?: string | null;
  brand: string;
  name: string;
  year: number | string;
}) {
  if (car.display_name?.trim()) {
    return car.display_name.replace(/\s+/g, " ").trim();
  }

  return `${car.brand} ${car.name} ${car.year}`.replace(/\s+/g, " ").trim();
}

export function buildGoogleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildGoogleMapsDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function buildGoogleMapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function isPlaceholderEmail(email: string) {
  const value = email.trim().toLowerCase();
  return !value || value.includes("example.com") || value.includes("example.org");
}

export function isPlaceholderTaxNumber(taxNumber: string) {
  const value = taxNumber.trim().toLowerCase();
  return !value || value.includes("to be added") || value.includes("add tax");
}

export function isDemoContactValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized.includes("000 000") ||
    normalized.includes("971000000000") ||
    normalized.includes("sales@example.com") ||
    normalized.includes("add your official") ||
    normalized.includes("from the dashboard") ||
    normalized === "primary showroom"
  );
}

export function buildLocalBusinessJsonLd(settings: {
  contact: {
    tradingName: string;
    legalName: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    country: string;
    mapUrl: string;
  };
}) {
  const address = {
    "@type": "PostalAddress",
    addressLocality: settings.contact.city,
    addressCountry: settings.contact.country,
    streetAddress: settings.contact.address,
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.contact.tradingName || settings.contact.legalName,
    address,
  };

  if (settings.contact.phone) {
    jsonLd.telephone = settings.contact.phone;
  }

  if (settings.contact.description) {
    jsonLd.description = settings.contact.description;
  }

  if (settings.contact.mapUrl) {
    jsonLd.hasMap = settings.contact.mapUrl;
  }

  if (!isPlaceholderEmail(settings.contact.email)) {
    jsonLd.email = settings.contact.email;
  }

  return jsonLd;
}
