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

  const existingCars = await db
    .selectFrom("cars")
    .select("id")
    .executeTakeFirst();

  if (!existingCars) {
    const cars = [
      {
        brand: "Toyota",
        name: "Land Cruiser",
        model: "VX-R",
        year: 2024,
        price: 389000,
        currency: "AED",
        price_label: "Starting from",
        description: "Flagship SUV with premium interior and powerful twin turbo performance.",
      },
      {
        brand: "Nissan",
        name: "Patrol",
        model: "LE Platinum",
        year: 2024,
        price: 345000,
        currency: "AED",
        price_label: "Starting from",
        description: "Luxury family SUV with 4WD confidence and advanced safety features.",
      },
      {
        brand: "BMW",
        name: "X5",
        model: "xDrive40i",
        year: 2024,
        price: 299000,
        currency: "AED",
        price_label: "Starting from",
        description: "Refined performance SUV with premium cabin comfort and modern technology.",
      },
      {
        brand: "Mercedes-Benz",
        name: "E-Class",
        model: "E 200",
        year: 2024,
        price: 269000,
        currency: "AED",
        price_label: "Starting from",
        description: "Elegant executive sedan with sleek design and a comfort-focused ride.",
      },
    ];

    for (const [index, car] of cars.entries()) {
      const carId = crypto.randomUUID();
      await db
        .insertInto("cars")
        .values({
          id: carId,
          slug: `${car.brand}-${car.name}-${car.year}`.toLowerCase().replaceAll(" ", "-"),
          gallery_ids: "[]",
          featured: 1,
          active: 1,
          sort_order: index + 1,
          main_image_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...car,
        })
        .execute();

      const specs = [
        "Premium Interior",
        "Advanced Safety",
        "4WD",
        "UAE Specification",
      ];

      for (const [specIndex, spec] of specs.entries()) {
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

      const colors = [
        { name: "Black", hex_code: "#121212" },
        { name: "Pearl White", hex_code: "#F2F2EE" },
        { name: "Champagne", hex_code: "#C9A07F" },
      ];

      for (const [colorIndex, color] of colors.entries()) {
        await db
          .insertInto("car_colors")
          .values({
            id: crypto.randomUUID(),
            car_id: carId,
            image_id: null,
            sort_order: colorIndex + 1,
            ...color,
          })
          .execute();
      }
    }
  }

  const existingReviews = await db
    .selectFrom("reviews")
    .select("id")
    .executeTakeFirst();

  if (!existingReviews) {
    const reviews = [
      "Demo review: replace this with a verified customer review from the dashboard.",
      "Demo review: highlight a smooth buying process and transparent support.",
      "Demo review: describe vehicle quality and after-sales communication.",
    ];

    for (const [index, review] of reviews.entries()) {
      await db
        .insertInto("reviews")
        .values({
          id: crypto.randomUUID(),
          customer_name: `Demo Customer ${index + 1}`,
          rating: 5,
          review_text: review,
          photo_id: null,
          review_date: new Date().toISOString().slice(0, 10),
          published: 1,
          sort_order: index + 1,
        })
        .execute();
    }
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
        name: "Primary Showroom",
        address: settings.contact.address,
        google_maps_url: settings.contact.mapUrl,
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
