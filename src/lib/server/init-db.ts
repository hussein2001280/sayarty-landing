import bcrypt from "bcryptjs";

import { db, ensureDatabase, getSiteSettings } from "@/lib/server/db";

async function seed() {
  await ensureDatabase();

  const settings = await getSiteSettings();

  const admin = await db
    .selectFrom("users")
    .select("id")
    .where("email", "=", process.env.ADMIN_EMAIL ?? "admin@sayarty.local")
    .executeTakeFirst();

  if (!admin) {
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

  const existingLocations = await db
    .selectFrom("locations")
    .select("id")
    .executeTakeFirst();

  if (!existingLocations) {
    await db
      .insertInto("locations")
      .values({
        id: crypto.randomUUID(),
        name: "Sayarty Online",
        address: settings.contact.address,
        city: settings.contact.city,
        country: settings.contact.country,
        google_maps_url: settings.contact.mapUrl,
        maps_search: settings.contact.mapsSearch,
        latitude: "",
        longitude: "",
        phone: settings.contact.phone,
        image_id: null,
        opening_hours: settings.contact.openingHours,
        active: 1,
        primary_location: 1,
        sort_order: 1,
      })
      .execute();
  }

  const existingTrust = await db
    .selectFrom("trust_features")
    .select("id")
    .executeTakeFirst();

  if (!existingTrust) {
    const features = [
      ["shield", "Carefully Selected Cars", "Premium vehicles curated for quality and condition."],
      ["badge-dollar-sign", "Competitive Prices", "Transparent pricing built for monthly campaigns."],
      ["headset", "Expert Support", "Fast answers across quote, WhatsApp, and phone."],
      ["map-pinned", "UAE Availability", "Offers tailored for UAE customers and locations."],
    ] as const;

    for (const [index, feature] of features.entries()) {
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
}

seed()
  .then(async () => {
    await db.destroy();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await db.destroy();
    process.exit(1);
  });
