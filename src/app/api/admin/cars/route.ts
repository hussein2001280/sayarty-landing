import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";
import { slugify } from "@/lib/utils";

function asString(value: unknown, fallback = "") {
  return String(value ?? fallback);
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBooleanFlag(value: unknown, fallback = true) {
  if (value === undefined || value === null) {
    return fallback ? 1 : 0;
  }

  return value ? 1 : 0;
}

export async function POST(request: Request) {
  await requireAdmin();
  await ensureDatabase();

  const body = await request.json();
  const carId = crypto.randomUUID();
  const now = new Date().toISOString();
  const brand = asString(body.brand);
  const name = asString(body.name);
  const year = asNumber(body.year, 2026);
  const displayName = asString(body.displayName) || `${brand} ${name} ${year}`.trim();

  await db
    .insertInto("cars")
    .values({
      id: carId,
      slug: slugify(`${brand} ${name} ${year}`),
      brand,
      name,
      model: asString(body.model),
      display_name: displayName,
      year,
      price: asNumber(body.price),
      currency: asString(body.currency, "AED") || "AED",
      price_label: asString(body.priceLabel, "Starting from") || "Starting from",
      body_type: asString(body.bodyType),
      transmission: asString(body.transmission),
      description: asString(body.description),
      main_image_id: body.mainImageId ? asString(body.mainImageId) : null,
      gallery_ids: JSON.stringify([]),
      featured: asBooleanFlag(body.featured, true),
      active: asBooleanFlag(body.active, true),
      sort_order: asNumber(body.sortOrder, Date.now()),
      created_at: now,
      updated_at: now,
    })
    .execute();

  const specs = Array.isArray(body.specs) ? body.specs : [];
  for (const [index, label] of specs.entries()) {
    await db
      .insertInto("car_specs")
      .values({
        id: crypto.randomUUID(),
        car_id: carId,
        label: String(label),
        sort_order: index + 1,
      })
      .execute();
  }

  const colors = Array.isArray(body.colors) ? body.colors : [];
  for (const [index, color] of colors.entries()) {
    await db
      .insertInto("car_colors")
      .values({
        id: crypto.randomUUID(),
        car_id: carId,
        name: asString(color.name, "Color") || "Color",
        hex_code: asString(color.hex_code, "#C9A07F") || "#C9A07F",
        image_id: color.image_id ? asString(color.image_id) : null,
        active: asBooleanFlag(color.active, true),
        sort_order: asNumber(color.sort_order, index + 1),
      })
      .execute();
  }

  return NextResponse.json({ success: true, id: carId });
}
