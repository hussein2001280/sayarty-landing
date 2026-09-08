import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  await requireAdmin();
  await ensureDatabase();

  const body = await request.json();
  const carId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .insertInto("cars")
    .values({
      id: carId,
      slug: slugify(`${body.brand} ${body.name} ${body.year}`),
      brand: String(body.brand ?? ""),
      name: String(body.name ?? ""),
      model: String(body.model ?? ""),
      year: Number(body.year ?? 2024),
      price: Number(body.price ?? 0),
      currency: String(body.currency ?? "AED"),
      price_label: String(body.priceLabel ?? "Starting from"),
      description: String(body.description ?? ""),
      main_image_id: body.mainImageId ? String(body.mainImageId) : null,
      gallery_ids: JSON.stringify([]),
      featured: body.featured ? 1 : 0,
      active: (body.active ?? true) ? 1 : 0,
      sort_order: Number(body.sortOrder ?? Date.now()),
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
        name: String(color.name ?? "Color"),
        hex_code: String(color.hex_code ?? "#C9A07F"),
        image_id: color.image_id ? String(color.image_id) : null,
        sort_order: index + 1,
      })
      .execute();
  }

  return NextResponse.json({ success: true });
}
