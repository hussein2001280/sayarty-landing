import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  await ensureDatabase();

  const { id } = await params;
  const body = await request.json();

  await db
    .updateTable("cars")
    .set({
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
      featured: body.featured ? 1 : 0,
      active: (body.active ?? true) ? 1 : 0,
      sort_order: Number(body.sortOrder ?? 0),
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", id)
    .execute();

  await db.deleteFrom("car_specs").where("car_id", "=", id).execute();
  await db.deleteFrom("car_colors").where("car_id", "=", id).execute();

  const specs = Array.isArray(body.specs) ? body.specs : [];
  for (const [index, label] of specs.entries()) {
    await db
      .insertInto("car_specs")
      .values({
        id: crypto.randomUUID(),
        car_id: id,
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
        car_id: id,
        name: String(color.name ?? "Color"),
        hex_code: String(color.hex_code ?? "#C9A07F"),
        image_id: color.image_id ? String(color.image_id) : null,
        sort_order: index + 1,
      })
      .execute();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();
  await ensureDatabase();

  const { id } = await params;
  await db.deleteFrom("car_specs").where("car_id", "=", id).execute();
  await db.deleteFrom("car_colors").where("car_id", "=", id).execute();
  await db.deleteFrom("cars").where("id", "=", id).execute();

  return NextResponse.json({ success: true });
}
