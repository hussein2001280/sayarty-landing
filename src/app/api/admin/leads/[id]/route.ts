import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  await ensureDatabase();

  const { id } = await params;
  const body = await request.json();

  await db
    .updateTable("leads")
    .set({
      status: String(body.status ?? "new") as "new",
    })
    .where("id", "=", id)
    .execute();

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();
  await ensureDatabase();

  const { id } = await params;
  await db.deleteFrom("leads").where("id", "=", id).execute();
  return NextResponse.json({ success: true });
}
