import Database from "better-sqlite3";
import { Kysely, MysqlDialect, SqliteDialect, sql } from "kysely";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import type { LeadStatus, SiteSettings } from "@/lib/types";

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
    year: number;
    price: number;
    currency: string;
    price_label: string;
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
    google_maps_url: string;
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
    eyebrow: "EXCLUSIVE OFFERS",
    heading: "Premium Cars.",
    highlightedHeading: "Great Offers.",
    description:
      "Carefully selected cars at competitive prices. Explore this month's special offers and get in touch with our team.",
    primaryCta: "Get a Quote",
    secondaryCta: "Chat on WhatsApp",
    heroImageId: null,
    heroImageAlt: "Featured vehicle offer",
    active: true,
  },
  seo: {
    title: "Sayarty | Premium Monthly Car Offers",
    description:
      "Explore premium monthly car offers in the UAE with Sayarty. Get a quote, chat on WhatsApp, and discover carefully selected featured cars.",
    ogTitle: "Sayarty | Premium Monthly Car Offers",
    ogDescription:
      "Premium automotive campaign landing page for featured UAE car offers.",
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
    tradingName: "Sayarty",
    legalName: "Arabity Online",
    description:
      "Premium cars, trusted by thousands. Update this text from the dashboard with your official company description.",
    phone: "+971 00 000 0000",
    email: "sales@example.com",
    whatsappNumber: "971000000000",
    whatsappTemplate:
      "Hello Sayarty, I'm interested in the {{car_name}} {{year}}. Please send me more details and the current price.",
    address: "Add your official UAE business address from the dashboard.",
    mapUrl: "",
    openingHours: "Mon-Sat, 9:00 AM - 8:00 PM",
    taxNumber: "Add tax registration number",
  },
  footer: {
    agencyCredit: "Website by Trendify Agency",
    copyrightLine: "© 2026 Sayarty. All rights reserved.",
  },
};

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
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL,
      price_label TEXT NOT NULL,
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
      google_maps_url TEXT NOT NULL,
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

  const existingCars = await db.selectFrom("cars").select("id").executeTakeFirst();

  if (!existingCars) {
    const seedCars = [
      ["Toyota", "Land Cruiser", "VX-R", 2024, 389000],
      ["Nissan", "Patrol", "LE Platinum", 2024, 345000],
      ["BMW", "X5", "xDrive40i", 2024, 299000],
      ["Mercedes-Benz", "E-Class", "E 200", 2024, 269000],
    ] as const;

    for (const [index, car] of seedCars.entries()) {
      const carId = crypto.randomUUID();

      await db
        .insertInto("cars")
        .values({
          id: carId,
          slug: `${car[0]}-${car[1]}-${car[3]}`.toLowerCase().replaceAll(" ", "-"),
          brand: car[0],
          name: car[1],
          model: car[2],
          year: car[3],
          price: car[4],
          currency: "AED",
          price_label: "Starting from",
          description: "Editable monthly campaign vehicle. Replace images, specs, and offer copy from the dashboard.",
          main_image_id: null,
          gallery_ids: "[]",
          featured: 1,
          active: 1,
          sort_order: index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .execute();

      for (const [specIndex, spec] of ["Premium Interior", "Advanced Safety", "4WD", "UAE Specification"].entries()) {
        await db
          .insertInto("car_specs")
          .values({
            id: crypto.randomUUID(),
            car_id: carId,
            label: spec,
            sort_order: specIndex + 1,
          })
          .execute();
      }

      for (const [colorIndex, color] of [
        ["Black", "#121212"],
        ["Pearl White", "#F2F2EE"],
        ["Champagne", "#C9A07F"],
      ].entries()) {
        await db
          .insertInto("car_colors")
          .values({
            id: crypto.randomUUID(),
            car_id: carId,
            name: color[0],
            hex_code: color[1],
            image_id: null,
            sort_order: colorIndex + 1,
          })
          .execute();
      }
    }
  }

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
        name: "Primary Showroom",
        address: defaultSettings.contact.address,
        google_maps_url: defaultSettings.contact.mapUrl,
        latitude: "",
        longitude: "",
        phone: defaultSettings.contact.phone,
        image_id: null,
        opening_hours: defaultSettings.contact.openingHours,
        active: 1,
        primary_location: 1,
        sort_order: 1,
      })
      .execute();
  }

  const existingReviews = await db.selectFrom("reviews").select("id").executeTakeFirst();
  if (!existingReviews) {
    for (const [index, text] of [
      "Demo review: replace this with a verified customer review from the dashboard.",
      "Demo review: highlight a smooth buying process and transparent support.",
      "Demo review: describe vehicle quality and after-sales communication.",
    ].entries()) {
      await db
        .insertInto("reviews")
        .values({
          id: crypto.randomUUID(),
          customer_name: `Demo Customer ${index + 1}`,
          rating: 5,
          review_text: text,
          photo_id: null,
          review_date: new Date().toISOString().slice(0, 10),
          published: 1,
          sort_order: index + 1,
        })
        .execute();
    }
  }
  })();

  try {
    await initializingDb;
  } finally {
    initializingDb = null;
  }
}

export async function getSiteSettings() {
  await ensureDatabase();

  const row = await db
    .selectFrom("site_settings")
    .selectAll()
    .where("key", "=", "site")
    .executeTakeFirst();

  return json.parse<SiteSettings>(row?.value_json ?? "{}", defaultSettings);
}

export async function saveSiteSettings(settings: SiteSettings) {
  await ensureDatabase();

  await db
    .updateTable("site_settings")
    .set({
      value_json: json.stringify(settings),
      updated_at: new Date().toISOString(),
    })
    .where("key", "=", "site")
    .execute();

  return settings;
}

export { defaultSettings };
