import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";
import type { DatabaseSchema } from "@/lib/server/db";
import { slugify } from "@/lib/utils";
import type { Updateable } from "kysely";

type Params = { params: Promise<{ id: string }> };

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

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  await ensureDatabase();

  const { id } = await params;
  const body = await request.json();

  const existing = await db.selectFrom("cars").selectAll().where("id", "=", id).executeTakeFirst();
  if (!existing) {
    return NextResponse.json({ error: "Car not found." }, { status: 404 });
  }

  const brand = body.brand !== undefined ? asString(body.brand) : existing.brand;
  const name = body.name !== undefined ? asString(body.name) : existing.name;
  const year = body.year !== undefined ? asNumber(body.year, existing.year) : existing.year;

  const patch: Updateable<DatabaseSchema["cars"]> = {
    updated_at: new Date().toISOString(),
  };

  if (body.brand !== undefined) patch.brand = brand;
  if (body.name !== undefined) patch.name = name;
  if (body.model !== undefined) patch.model = asString(body.model);
  if (body.displayName !== undefined) patch.display_name = asString(body.displayName);
  if (body.year !== undefined) patch.year = year;
  if (body.price !== undefined) patch.price = asNumber(body.price);
  if (body.currency !== undefined) patch.currency = asString(body.currency, "AED") || "AED";
  if (body.priceLabel !== undefined) patch.price_label = asString(body.priceLabel, "Starting from");
  if (body.bodyType !== undefined) patch.body_type = asString(body.bodyType);
  if (body.transmission !== undefined) patch.transmission = asString(body.transmission);
  if (body.description !== undefined) patch.description = asString(body.description);
  if (body.mainImageId !== undefined) patch.main_image_id = body.mainImageId ? asString(body.mainImageId) : null;
  if (body.featured !== undefined) patch.featured = asBooleanFlag(body.featured, Boolean(existing.featured));
  if (body.active !== undefined) patch.active = asBooleanFlag(body.active, Boolean(existing.active));
  if (body.sortOrder !== undefined) patch.sort_order = asNumber(body.sortOrder, existing.sort_order);

  if (body.brand !== undefined || body.name !== undefined || body.year !== undefined) {
    patch.slug = slugify(`${brand} ${name} ${year}`);
  }

  await db
    .updateTable("cars")
    .set(patch)
    .where("id", "=", id)
    .execute();

  if (Array.isArray(body.specs)) {
    await db.deleteFrom("car_specs").where("car_id", "=", id).execute();
    for (const [index, label] of body.specs.entries()) {
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
  }

  if (Array.isArray(body.colors)) {
    await db.deleteFrom("car_colors").where("car_id", "=", id).execute();
    for (const [index, color] of body.colors.entries()) {
      await db
        .insertInto("car_colors")
        .values({
          id: crypto.randomUUID(),
          car_id: id,
          name: asString(color.name, "Color") || "Color",
          hex_code: asString(color.hex_code, "#C9A07F") || "#C9A07F",
          image_id: color.image_id ? asString(color.image_id) : null,
          active: asBooleanFlag(color.active, true),
          sort_order: asNumber(color.sort_order, index + 1),
        })
        .execute();
    }
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
