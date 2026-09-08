import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

const allowedTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

export async function POST(request: Request) {
  await requireAdmin();
  await ensureDatabase();

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "car");
  const alt = String(formData.get("alt") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be smaller than 4MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const media = {
    id: crypto.randomUUID(),
    file_name: file.name,
    mime_type: file.type,
    kind,
    alt_text: alt,
    data_uri: dataUri,
    size: file.size,
    created_at: new Date().toISOString(),
  };

  await db.insertInto("media").values(media).execute();

  return NextResponse.json(media);
}
