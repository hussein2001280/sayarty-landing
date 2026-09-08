import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase, saveSiteSettings } from "@/lib/server/db";

export async function POST(request: Request) {
  await requireAdmin();
  await ensureDatabase();

  const body = await request.json();

  if (body.siteSettings) {
    await saveSiteSettings(body.siteSettings);
  }

  if (Array.isArray(body.reviews)) {
    await db.deleteFrom("reviews").execute();
    for (const [index, review] of body.reviews.entries()) {
      await db
        .insertInto("reviews")
        .values({
          id: review.id ? String(review.id) : crypto.randomUUID(),
          customer_name: String(review.customer_name ?? "Demo Customer"),
          rating: Number(review.rating ?? 5),
          review_text: String(review.review_text ?? ""),
          photo_id: review.photo_id ? String(review.photo_id) : null,
          review_date: review.review_date ? String(review.review_date) : null,
          published: (review.published ?? true) ? 1 : 0,
          sort_order: Number(review.sort_order ?? index + 1),
        })
        .execute();
    }
  }

  if (Array.isArray(body.locations)) {
    await db.deleteFrom("locations").execute();
    for (const [index, location] of body.locations.entries()) {
      await db
        .insertInto("locations")
        .values({
          id: location.id ? String(location.id) : crypto.randomUUID(),
          name: String(location.name ?? "Location"),
          address: String(location.address ?? ""),
          google_maps_url: String(location.google_maps_url ?? ""),
          latitude: String(location.latitude ?? ""),
          longitude: String(location.longitude ?? ""),
          phone: String(location.phone ?? ""),
          image_id: location.image_id ? String(location.image_id) : null,
          opening_hours: String(location.opening_hours ?? ""),
          active: (location.active ?? true) ? 1 : 0,
          primary_location: (location.primary_location ?? index === 0) ? 1 : 0,
          sort_order: Number(location.sort_order ?? index + 1),
        })
        .execute();
    }
  }

  if (Array.isArray(body.trustFeatures)) {
    await db.deleteFrom("trust_features").execute();
    for (const [index, feature] of body.trustFeatures.entries()) {
      await db
        .insertInto("trust_features")
        .values({
          id: feature.id ? String(feature.id) : crypto.randomUUID(),
          icon: String(feature.icon ?? "shield"),
          title: String(feature.title ?? ""),
          description: String(feature.description ?? ""),
          visible: (feature.visible ?? true) ? 1 : 0,
          sort_order: Number(feature.sort_order ?? index + 1),
        })
        .execute();
    }
  }

  return NextResponse.json({ success: true });
}
