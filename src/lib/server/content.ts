import { db, ensureDatabase, getSiteSettings, json } from "@/lib/server/db";

export async function getCars() {
  await ensureDatabase();

  const cars = await db
    .selectFrom("cars")
    .selectAll()
    .where("active", "=", 1)
    .orderBy("sort_order", "asc")
    .execute();

  return Promise.all(
    cars.map(async (car) => {
      const [colors, specs, image] = await Promise.all([
        db
          .selectFrom("car_colors")
          .selectAll()
          .where("car_id", "=", car.id)
          .orderBy("sort_order", "asc")
          .execute(),
        db
          .selectFrom("car_specs")
          .selectAll()
          .where("car_id", "=", car.id)
          .orderBy("sort_order", "asc")
          .execute(),
        car.main_image_id
          ? db.selectFrom("media").selectAll().where("id", "=", car.main_image_id).executeTakeFirst()
          : Promise.resolve(undefined),
      ]);

      return {
        ...car,
        galleryIds: json.parse<string[]>(car.gallery_ids, []),
        colors,
        specs,
        image,
      };
    }),
  );
}

export async function getLandingData() {
  const [settings, cars, trustFeatures, reviews, locations] = await Promise.all([
    getSiteSettings(),
    getCars(),
    db
      .selectFrom("trust_features")
      .selectAll()
      .where("visible", "=", 1)
      .orderBy("sort_order", "asc")
      .execute(),
    db
      .selectFrom("reviews")
      .selectAll()
      .where("published", "=", 1)
      .orderBy("sort_order", "asc")
      .limit(3)
      .execute(),
    db
      .selectFrom("locations")
      .selectAll()
      .where("active", "=", 1)
      .orderBy("primary_location", "desc")
      .orderBy("sort_order", "asc")
      .execute(),
  ]);

  const mediaIds = [
    settings.hero.heroImageId,
    settings.seo.ogImageId,
    ...cars.map((car) => car.main_image_id),
    ...locations.map((location) => location.image_id),
    ...reviews.map((review) => review.photo_id),
  ].filter(Boolean) as string[];

  const media =
    mediaIds.length > 0
      ? await db.selectFrom("media").selectAll().where("id", "in", mediaIds).execute()
      : [];

  const mediaById = new Map(media.map((item) => [item.id, item]));

  return {
    settings,
    cars: cars.map((car) => ({
      ...car,
      image: car.main_image_id ? mediaById.get(car.main_image_id) ?? null : null,
    })),
    trustFeatures,
    reviews: reviews.map((review) => ({
      ...review,
      photo: review.photo_id ? mediaById.get(review.photo_id) ?? null : null,
    })),
    locations: locations.map((location) => ({
      ...location,
      image: location.image_id ? mediaById.get(location.image_id) ?? null : null,
    })),
    heroMedia: settings.hero.heroImageId
      ? mediaById.get(settings.hero.heroImageId) ?? null
      : null,
    ogMedia: settings.seo.ogImageId ? mediaById.get(settings.seo.ogImageId) ?? null : null,
  };
}

export type LandingData = Awaited<ReturnType<typeof getLandingData>>;

export async function getOverviewData() {
  await ensureDatabase();

  const leads = await db.selectFrom("leads").selectAll().execute();
  const cars = await db.selectFrom("cars").select(["id", "brand", "name", "year"]).execute();

  const topCars = cars
    .map((car) => ({
      label: `${car.brand} ${car.name} ${car.year}`,
      leads: leads.filter((lead) => lead.car_id === car.id).length,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  return {
    metrics: {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "new").length,
      contactedLeads: leads.filter((lead) => lead.status === "contacted").length,
      qualifiedLeads: leads.filter((lead) => lead.status === "qualified").length,
      closedLeads: leads.filter((lead) => lead.status === "closed").length,
    },
    topCars,
    recentLeads: leads.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
  };
}
