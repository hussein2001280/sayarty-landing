import Database from "better-sqlite3";
import { Kysely, MysqlDialect, SqliteDialect, sql } from "kysely";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { SAYARTY_BUSINESS, buildGoogleMapsSearchUrl, isDemoContactValue } from "@/lib/business";
import {
  CAMPAIGN_CARS,
  CURRENT_CAMPAIGN_VERSION,
  PLACEHOLDER_COLORS,
} from "@/lib/campaign-cars";
import { CUSTOMER_REVIEWS, CUSTOMER_REVIEWS_VERSION } from "@/lib/customer-reviews";
import type { LeadStatus, SiteSettings } from "@/lib/types";
import { mergeDefined } from "@/lib/utils";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface DatabaseSchema {
  users: {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    created_at: string;
  };
  media: {
    id: string;
    file_name: string;
    mime_type: string;
    kind: string;
    alt_text: string;
    data_uri: string;
    size: number;
    created_at: string;
  };
  cars: {
    id: string;
    slug: string;
    brand: string;
    name: string;
    model: string;
    display_name: string;
    year: number;
    price: number;
    currency: string;
    price_label: string;
    body_type: string;
    transmission: string;
    description: string;
    main_image_id: string | null;
    gallery_ids: string;
    featured: number;
    active: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
  };
  car_colors: {
    id: string;
    car_id: string;
    name: string;
    hex_code: string;
    image_id: string | null;
    active: number;
    sort_order: number;
  };
  car_specs: {
    id: string;
    car_id: string;
    label: string;
    sort_order: number;
  };
  reviews: {
    id: string;
    customer_name: string;
    rating: number;
    review_text: string;
    photo_id: string | null;
    review_date: string | null;
    published: number;
    sort_order: number;
  };
  locations: {
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
  trust_features: {
    id: string;
    icon: string;
    title: string;
    description: string;
    visible: number;
    sort_order: number;
  };
  leads: {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    message: string;
    preferred_contact_method: string;
    car_id: string | null;
    car_label: string;
    source: string;
    landing_page: string;
    referrer: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term: string;
    utm_content: string;
    gclid: string;
    wbraid: string;
    gbraid: string;
    status: LeadStatus;
    created_at: string;
  };
  site_settings: {
    id: string;
    key: string;
    value_json: string;
    updated_at: string;
  };
}

const defaultSettings: SiteSettings = {
  hero: {
    eyebrow: "EXCLUSIVE OFFER",
    heading: "Premium Cars.",
    highlightedHeading: "Great Offers.",
    description:
      "Carefully selected cars at competitive prices. Explore our latest offers and get in touch with our team.",
    primaryCta: "Get a Quote",
    secondaryCta: "Chat on WhatsApp",
    featuredCarId: null,
    heroImageId: null,
    heroImageAlt: "Featured vehicle offer",
    active: true,
  },
  seo: {
    title: "Sayarty Online | Premium Monthly Car Offers",
    description:
      "Explore premium monthly car offers in Dubai, United Arab Emirates with Sayarty Online. Get a quote, chat on WhatsApp, and discover carefully selected featured cars.",
    ogTitle: "Sayarty Online | Premium Monthly Car Offers",
    ogDescription:
      "Premium automotive campaign landing page for featured UAE car offers from Sayarty Online.",
    canonicalUrl: "",
    ogImageId: null,
    robots: "index,follow",
  },
  tracking: {
    gtmId: "",
    ga4Id: "",
    googleAdsConversionId: "",
    googleAdsConversionLabel: "",
  },
  contact: {
    tradingName: SAYARTY_BUSINESS.name,
    legalName: SAYARTY_BUSINESS.name,
    description:
      "Premium cars, trusted by thousands. Carefully selected vehicles with competitive prices across the UAE.",
    phone: SAYARTY_BUSINESS.phone,
    email: "",
    whatsappNumber: SAYARTY_BUSINESS.whatsappNumber,
    whatsappTemplate:
      "Hello Sayarty Online, I'm interested in the {{car_name}}. Please send me more details and the current price.",
    address: SAYARTY_BUSINESS.address,
    city: SAYARTY_BUSINESS.city,
    country: SAYARTY_BUSINESS.country,
    mapUrl: buildGoogleMapsSearchUrl(SAYARTY_BUSINESS.mapsSearch),
    mapsSearch: SAYARTY_BUSINESS.mapsSearch,
    openingHours: "",
    taxNumber: SAYARTY_BUSINESS.taxNumberPlaceholder,
  },
  why: {
    eyebrow: "Why Sayarty",
    heading: "A Better Way to Find Your Next Car",
    description:
      "Keep the offer clear, the pricing transparent, and the conversation easy. That is what makes paid traffic convert.",
  },
  cta: {
    eyebrow: "READY TO DRIVE?",
    heading: "Let's Find Your Perfect Car",
    description: "Explore this month's offers or speak with our team today.",
    primaryCta: "Get a Quote",
    secondaryCta: "Chat on WhatsApp",
    backgroundImageId: null,
  },
  footer: {
    agencyCredit: "Website by Trendify Agency",
    agencyUrl: SAYARTY_BUSINESS.agencyUrl,
    copyrightLine: "© 2026 Sayarty. All rights reserved.",
  },
  pricing: {
    currencyCode: "AED",
    symbolPosition: "before",
  },
};

function mergeSiteSettings(stored?: Partial<SiteSettings> | null): SiteSettings {
  return {
    hero: mergeDefined(defaultSettings.hero, stored?.hero),
    seo: mergeDefined(defaultSettings.seo, stored?.seo),
    tracking: mergeDefined(defaultSettings.tracking, stored?.tracking),
    contact: mergeDefined(defaultSettings.contact, stored?.contact),
    why: mergeDefined(defaultSettings.why, stored?.why),
    cta: mergeDefined(defaultSettings.cta, stored?.cta),
    footer: mergeDefined(defaultSettings.footer, stored?.footer),
    pricing: mergeDefined(defaultSettings.pricing, stored?.pricing),
  };
}

function withRealBusinessDefaults(settings: SiteSettings): SiteSettings {
  const contact = { ...settings.contact };
  const footer = { ...settings.footer };

  contact.phone = contact.phone.trim();
  contact.city = contact.city.trim();
  contact.country = contact.country.trim();
  contact.address = contact.address.trim();
  contact.mapsSearch = contact.mapsSearch.trim();
  contact.tradingName = contact.tradingName.trim();
  contact.legalName = contact.legalName.trim();

  if (isDemoContactValue(contact.phone) || contact.phone.includes("00 000")) {
    contact.phone = SAYARTY_BUSINESS.phone;
  }

  if (isDemoContactValue(contact.whatsappNumber) || contact.whatsappNumber.includes("000000")) {
    contact.whatsappNumber = SAYARTY_BUSINESS.whatsappNumber;
  }

  if (isDemoContactValue(contact.address)) {
    contact.address = SAYARTY_BUSINESS.address;
  }

  if (!contact.city || isDemoContactValue(contact.city)) {
    contact.city = SAYARTY_BUSINESS.city;
  }

  if (!contact.country || isDemoContactValue(contact.country)) {
    contact.country = SAYARTY_BUSINESS.country;
  }

  if (!contact.mapsSearch || isDemoContactValue(contact.mapsSearch)) {
    contact.mapsSearch = SAYARTY_BUSINESS.mapsSearch;
  }

  if (!contact.mapUrl || isDemoContactValue(contact.mapUrl)) {
    contact.mapUrl = buildGoogleMapsSearchUrl(contact.mapsSearch || SAYARTY_BUSINESS.mapsSearch);
  }

  if (contact.legalName === "Arabity Online" || isDemoContactValue(contact.legalName)) {
    contact.legalName = SAYARTY_BUSINESS.name;
  }

  if (contact.tradingName === "Sayarty" || isDemoContactValue(contact.tradingName)) {
    contact.tradingName = SAYARTY_BUSINESS.name;
  }

  if (
    contact.description.includes("Update this text from the dashboard")
  ) {
    contact.description =
      "Premium cars, trusted by thousands. Carefully selected vehicles with competitive prices across the UAE.";
  }

  if (contact.taxNumber.toLowerCase().includes("add tax")) {
    contact.taxNumber = SAYARTY_BUSINESS.taxNumberPlaceholder;
  }

  if (contact.openingHours === "Mon-Sat, 9:00 AM - 8:00 PM") {
    contact.openingHours = "";
  }

  if (
    contact.whatsappTemplate.includes("Hello Sayarty,") ||
    contact.whatsappTemplate.includes("{{car_name}} {{year}}")
  ) {
    contact.whatsappTemplate =
      "Hello Sayarty Online, I'm interested in the {{car_name}}. Please send me more details and the current price.";
  }

  if (!footer.agencyUrl) {
    footer.agencyUrl = SAYARTY_BUSINESS.agencyUrl;
  }

  if (!footer.agencyCredit) {
    footer.agencyCredit = "Website by Trendify Agency";
  }

  const seo = { ...settings.seo };
  const hero = { ...settings.hero };
  if (seo.title === "Sayarty | Premium Monthly Car Offers") {
    seo.title = defaultSettings.seo.title;
  }
  if (seo.ogTitle === "Sayarty | Premium Monthly Car Offers") {
    seo.ogTitle = defaultSettings.seo.ogTitle;
  }
  if (hero.eyebrow === "EXCLUSIVE OFFERS") {
    hero.eyebrow = defaultSettings.hero.eyebrow;
  }
  if (
    hero.description.includes("special offers and get in touch") ||
    hero.description.includes("this month's featured vehicles")
  ) {
    hero.description = defaultSettings.hero.description;
  }

  return {
    ...settings,
    hero,
    contact,
    why: mergeDefined(defaultSettings.why, settings.why),
    cta: mergeDefined(defaultSettings.cta, settings.cta),
    footer,
    seo,
    pricing: mergeDefined(defaultSettings.pricing, settings.pricing),
  };
}

function createDialect() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl?.startsWith("mysql://")) {
    return new MysqlDialect({
      pool: mysql.createPool(databaseUrl),
    });
  }

  const sqlitePath = process.env.SQLITE_PATH ?? "data/sayarty.db";
  mkdirSync(dirname(sqlitePath), { recursive: true });

  return new SqliteDialect({
    database: new Database(sqlitePath),
  });
}

export const db = new Kysely<DatabaseSchema>({
  dialect: createDialect(),
});

let initializingDb: Promise<void> | null = null;

export const json = {
  parse<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  },
  stringify(value: JsonValue) {
    return JSON.stringify(value);
  },
};

export async function ensureDatabase() {
  if (initializingDb) {
    await initializingDb;
    return;
  }

  initializingDb = (async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      kind TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      data_uri TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL,
      price_label TEXT NOT NULL,
      body_type TEXT NOT NULL DEFAULT '',
      transmission TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      main_image_id TEXT,
      gallery_ids TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS car_colors (
      id TEXT PRIMARY KEY,
      car_id TEXT NOT NULL,
      name TEXT NOT NULL,
      hex_code TEXT NOT NULL,
      image_id TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS car_specs (
      id TEXT PRIMARY KEY,
      car_id TEXT NOT NULL,
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      photo_id TEXT,
      review_date TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      google_maps_url TEXT NOT NULL,
      maps_search TEXT NOT NULL DEFAULT '',
      latitude TEXT NOT NULL,
      longitude TEXT NOT NULL,
      phone TEXT NOT NULL,
      image_id TEXT,
      opening_hours TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      primary_location INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `.execute(db);

  await ensureLocationColumns();
  await ensureCarColumns();

  await sql`
    CREATE TABLE IF NOT EXISTS trust_features (
      id TEXT PRIMARY KEY,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      preferred_contact_method TEXT NOT NULL,
      car_id TEXT,
      car_label TEXT NOT NULL,
      source TEXT NOT NULL,
      landing_page TEXT NOT NULL,
      referrer TEXT NOT NULL,
      utm_source TEXT NOT NULL,
      utm_medium TEXT NOT NULL,
      utm_campaign TEXT NOT NULL,
      utm_term TEXT NOT NULL,
      utm_content TEXT NOT NULL,
      gclid TEXT NOT NULL,
      wbraid TEXT NOT NULL,
      gbraid TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `.execute(db);

  const existingHero = await db
    .selectFrom("site_settings")
    .select("id")
    .where("key", "=", "site")
    .executeTakeFirst();

  if (!existingHero) {
    await db
      .insertInto("site_settings")
      .values({
        id: crypto.randomUUID(),
        key: "site",
        value_json: json.stringify(defaultSettings),
        updated_at: new Date().toISOString(),
      })
      .execute();
  }

  const existingAdmin = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", process.env.ADMIN_EMAIL ?? "admin@sayarty.local")
    .executeTakeFirst();

  if (!existingAdmin) {
    await db
      .insertInto("users")
      .values({
        id: crypto.randomUUID(),
        email: process.env.ADMIN_EMAIL ?? "admin@sayarty.local",
        name: "Sayarty Admin",
        password_hash: await bcrypt.hash(
          process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
          10,
        ),
        created_at: new Date().toISOString(),
      })
      .execute();
  }

  await syncCampaignCars();

  const existingTrust = await db.selectFrom("trust_features").select("id").executeTakeFirst();
  if (!existingTrust) {
    for (const [index, feature] of [
      ["shield", "Carefully Selected Cars", "Premium vehicles curated for quality and condition."],
      ["badge-dollar-sign", "Competitive Prices", "Transparent pricing built for monthly campaigns."],
      ["headset", "Expert Support", "Fast answers across quote, WhatsApp, and phone."],
      ["map-pinned", "UAE Availability", "Offers tailored for UAE customers and locations."],
    ].entries()) {
      await db
        .insertInto("trust_features")
        .values({
          id: crypto.randomUUID(),
          icon: feature[0],
          title: feature[1],
          description: feature[2],
          visible: 1,
          sort_order: index + 1,
        })
        .execute();
    }
  }

  const existingLocations = await db.selectFrom("locations").select("id").executeTakeFirst();
  if (!existingLocations) {
    await db
      .insertInto("locations")
      .values({
        id: crypto.randomUUID(),
        name: SAYARTY_BUSINESS.name,
        address: SAYARTY_BUSINESS.address,
        city: SAYARTY_BUSINESS.city,
        country: SAYARTY_BUSINESS.country,
        google_maps_url: defaultSettings.contact.mapUrl,
        maps_search: SAYARTY_BUSINESS.mapsSearch,
        latitude: "",
        longitude: "",
        phone: SAYARTY_BUSINESS.phone,
        image_id: null,
        opening_hours: "",
        active: 1,
        primary_location: 1,
        sort_order: 1,
      })
      .execute();
  } else {
    await migrateDemoLocations();
  }

  await syncCustomerReviews();

  await persistMigratedSettings();
  })();

  try {
    await initializingDb;
  } finally {
    initializingDb = null;
  }
}

async function ensureLocationColumns() {
  const statements = [
    sql`ALTER TABLE locations ADD COLUMN city TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE locations ADD COLUMN country TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE locations ADD COLUMN maps_search TEXT NOT NULL DEFAULT ''`,
  ];

  for (const statement of statements) {
    try {
      await statement.execute(db);
    } catch {
      // Column already exists on upgraded databases.
    }
  }
}

async function ensureCarColumns() {
  const statements = [
    sql`ALTER TABLE cars ADD COLUMN display_name TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE cars ADD COLUMN body_type TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE cars ADD COLUMN transmission TEXT NOT NULL DEFAULT ''`,
    sql`ALTER TABLE car_colors ADD COLUMN active INTEGER NOT NULL DEFAULT 1`,
  ];

  for (const statement of statements) {
    try {
      await statement.execute(db);
    } catch {
      // Column already exists on upgraded databases.
    }
  }
}

async function replaceCarSpecs(carId: string, specs: readonly string[]) {
  await db.deleteFrom("car_specs").where("car_id", "=", carId).execute();

  for (const [index, label] of specs.entries()) {
    await db
      .insertInto("car_specs")
      .values({
        id: crypto.randomUUID(),
        car_id: carId,
        label,
        sort_order: index + 1,
      })
      .execute();
  }
}

async function seedPlaceholderColors(carId: string) {
  const existing = await db
    .selectFrom("car_colors")
    .select("id")
    .where("car_id", "=", carId)
    .executeTakeFirst();

  if (existing) {
    return;
  }

  for (const [index, color] of PLACEHOLDER_COLORS.entries()) {
    await db
      .insertInto("car_colors")
      .values({
        id: crypto.randomUUID(),
        car_id: carId,
        name: color.name,
        hex_code: color.hex_code,
        image_id: null,
        active: 1,
        sort_order: index + 1,
      })
      .execute();
  }
}

async function syncCampaignCars() {
  const versionRow = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "campaign_version")
    .executeTakeFirst();

  const storedVersion = json.parse<string>(versionRow?.value_json ?? '""', "");
  if (storedVersion === CURRENT_CAMPAIGN_VERSION) {
    return;
  }

  const campaignIds: string[] = [];
  const now = new Date().toISOString();

  for (const car of CAMPAIGN_CARS) {
    const existing = await db
      .selectFrom("cars")
      .select(["id"])
      .where("slug", "=", car.slug)
      .executeTakeFirst();

    const carId = existing?.id ?? crypto.randomUUID();
    const values = {
      slug: car.slug,
      brand: car.brand,
      name: car.name,
      model: car.model,
      display_name: car.displayName,
      year: car.year,
      price: car.price,
      currency: car.currency,
      price_label: car.priceLabel,
      body_type: car.bodyType,
      transmission: car.transmission,
      description: car.description,
      featured: 1,
      active: 1,
      sort_order: car.sortOrder,
      updated_at: now,
    };

    if (existing) {
      await db.updateTable("cars").set(values).where("id", "=", carId).execute();
    } else {
      await db
        .insertInto("cars")
        .values({
          id: carId,
          ...values,
          main_image_id: null,
          gallery_ids: "[]",
          created_at: now,
        })
        .execute();
    }

    await replaceCarSpecs(carId, car.specs);
    await seedPlaceholderColors(carId);
    campaignIds.push(carId);
  }

  const otherCars = await db.selectFrom("cars").select("id").execute();
  for (const car of otherCars) {
    if (!campaignIds.includes(car.id)) {
      await db
        .updateTable("cars")
        .set({
          active: 0,
          featured: 0,
          updated_at: now,
        })
        .where("id", "=", car.id)
        .execute();
    }
  }

  const settingsRow = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "site")
    .executeTakeFirst();

  if (settingsRow) {
    const settings = withRealBusinessDefaults(
      mergeSiteSettings(json.parse<Partial<SiteSettings>>(settingsRow.value_json ?? "{}", {})),
    );

    if (!settings.hero.featuredCarId || !campaignIds.includes(settings.hero.featuredCarId)) {
      settings.hero.featuredCarId = campaignIds[0] ?? null;
      await db
        .updateTable("site_settings")
        .set({
          value_json: json.stringify(settings),
          updated_at: now,
        })
        .where("key", "=", "site")
        .execute();
    }
  }

  if (versionRow) {
    await db
      .updateTable("site_settings")
      .set({
        value_json: json.stringify(CURRENT_CAMPAIGN_VERSION),
        updated_at: now,
      })
      .where("key", "=", "campaign_version")
      .execute();
  } else {
    await db
      .insertInto("site_settings")
      .values({
        id: crypto.randomUUID(),
        key: "campaign_version",
        value_json: json.stringify(CURRENT_CAMPAIGN_VERSION),
        updated_at: now,
      })
      .execute();
  }
}

async function syncCustomerReviews() {
  const versionRow = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "reviews_version")
    .executeTakeFirst();

  const storedVersion = json.parse<string>(versionRow?.value_json ?? '""', "");
  if (storedVersion === CUSTOMER_REVIEWS_VERSION) {
    return;
  }

  const existing = await db.selectFrom("reviews").select(["customer_name", "sort_order"]).execute();
  const existingNames = new Set(existing.map((review) => review.customer_name.trim().toLowerCase()));
  let nextSort = existing.reduce((max, review) => Math.max(max, review.sort_order), 0);
  const now = new Date().toISOString().slice(0, 10);

  for (const review of CUSTOMER_REVIEWS) {
    if (existingNames.has(review.customer_name.trim().toLowerCase())) {
      continue;
    }

    nextSort += 1;
    await db
      .insertInto("reviews")
      .values({
        id: crypto.randomUUID(),
        customer_name: review.customer_name,
        rating: review.rating,
        review_text: review.review_text,
        photo_id: null,
        review_date: now,
        published: 1,
        sort_order: nextSort,
      })
      .execute();
  }

  if (versionRow) {
    await db
      .updateTable("site_settings")
      .set({
        value_json: json.stringify(CUSTOMER_REVIEWS_VERSION),
        updated_at: new Date().toISOString(),
      })
      .where("key", "=", "reviews_version")
      .execute();
  } else {
    await db
      .insertInto("site_settings")
      .values({
        id: crypto.randomUUID(),
        key: "reviews_version",
        value_json: json.stringify(CUSTOMER_REVIEWS_VERSION),
        updated_at: new Date().toISOString(),
      })
      .execute();
  }
}

async function migrateDemoLocations() {
  const locations = await db.selectFrom("locations").selectAll().execute();

  for (const location of locations) {
    const shouldReplace =
      isDemoContactValue(location.name) ||
      isDemoContactValue(location.address) ||
      isDemoContactValue(location.phone);

    if (!shouldReplace && location.city && location.country && location.maps_search) {
      continue;
    }

    await db
      .updateTable("locations")
      .set({
        name: shouldReplace ? SAYARTY_BUSINESS.name : location.name,
        address: shouldReplace || isDemoContactValue(location.address) ? SAYARTY_BUSINESS.address : location.address,
        city: location.city || SAYARTY_BUSINESS.city,
        country: location.country || SAYARTY_BUSINESS.country,
        maps_search: location.maps_search || SAYARTY_BUSINESS.mapsSearch,
        google_maps_url:
          shouldReplace || !location.google_maps_url
            ? buildGoogleMapsSearchUrl(SAYARTY_BUSINESS.mapsSearch)
            : location.google_maps_url,
        phone: shouldReplace || isDemoContactValue(location.phone) ? SAYARTY_BUSINESS.phone : location.phone,
        opening_hours: location.opening_hours === "Mon-Sat, 9:00 AM - 8:00 PM" ? "" : location.opening_hours,
      })
      .where("id", "=", location.id)
      .execute();
  }
}

async function persistMigratedSettings() {
  const row = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "site")
    .executeTakeFirst();

  const merged = withRealBusinessDefaults(
    mergeSiteSettings(json.parse<Partial<SiteSettings>>(row?.value_json ?? "{}", {})),
  );

  if (!merged.hero.featuredCarId) {
    const firstCar = await db
      .selectFrom("cars")
      .select("id")
      .where("active", "=", 1)
      .where("featured", "=", 1)
      .orderBy("sort_order", "asc")
      .executeTakeFirst();

    if (firstCar) {
      merged.hero.featuredCarId = firstCar.id;
    }
  }

  if (!row) {
    return;
  }

  if (row.value_json !== json.stringify(merged)) {
    await db
      .updateTable("site_settings")
      .set({
        value_json: json.stringify(merged),
        updated_at: new Date().toISOString(),
      })
      .where("key", "=", "site")
      .execute();
  }
}

export async function getSiteSettings() {
  await ensureDatabase();

  const row = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "site")
    .executeTakeFirst();

  const merged = withRealBusinessDefaults(
    mergeSiteSettings(json.parse<Partial<SiteSettings>>(row?.value_json ?? "{}", {})),
  );

  if (!merged.hero.featuredCarId) {
    const firstCar = await db
      .selectFrom("cars")
      .select("id")
      .where("active", "=", 1)
      .where("featured", "=", 1)
      .orderBy("sort_order", "asc")
      .executeTakeFirst();

    if (firstCar) {
      merged.hero.featuredCarId = firstCar.id;
    }
  }

  return merged;
}

export async function saveSiteSettings(settings: Partial<SiteSettings> | SiteSettings) {
  await ensureDatabase();
  const current = await getSiteSettings();
  const next = mergeSiteSettings({
    hero: { ...current.hero, ...settings.hero },
    seo: { ...current.seo, ...settings.seo },
    tracking: { ...current.tracking, ...settings.tracking },
    contact: { ...current.contact, ...settings.contact },
    why: { ...current.why, ...settings.why },
    cta: { ...current.cta, ...settings.cta },
    footer: { ...current.footer, ...settings.footer },
    pricing: { ...current.pricing, ...settings.pricing },
  });

  await db
    .updateTable("site_settings")
    .set({
      value_json: json.stringify(next),
      updated_at: new Date().toISOString(),
    })
    .where("key", "=", "site")
    .execute();

  return next;
}

export { defaultSettings };
