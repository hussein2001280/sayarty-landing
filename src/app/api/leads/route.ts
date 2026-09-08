import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { db, ensureDatabase, getSiteSettings } from "@/lib/server/db";
import { buildLeadEmail, sendLeadNotification } from "@/lib/server/email";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { leadSchema } from "@/lib/server/schemas";

export async function POST(request: Request) {
  await ensureDatabase();

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`lead:${forwardedFor}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const parsed = leadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  if (payload.honeypot) {
    return NextResponse.json({ success: true });
  }

  const car = await db
    .selectFrom("cars")
    .select(["id", "brand", "name", "year"])
    .where("id", "=", payload.carId)
    .executeTakeFirst();

  if (!car) {
    return NextResponse.json({ error: "Selected car was not found." }, { status: 404 });
  }

  const carLabel = `${car.brand} ${car.name} ${car.year}`;

  await db
    .insertInto("leads")
    .values({
      id: crypto.randomUUID(),
      full_name: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      message: payload.message ?? "",
      preferred_contact_method: payload.preferredContactMethod,
      car_id: payload.carId,
      car_label: carLabel,
      source: payload.source,
      landing_page: payload.landingPage,
      referrer: payload.referrer,
      utm_source: payload.utmSource,
      utm_medium: payload.utmMedium,
      utm_campaign: payload.utmCampaign,
      utm_term: payload.utmTerm,
      utm_content: payload.utmContent,
      gclid: payload.gclid,
      wbraid: payload.wbraid,
      gbraid: payload.gbraid,
      status: "new",
      created_at: new Date().toISOString(),
    })
    .execute();

  const settings = await getSiteSettings();
  await sendLeadNotification({
    to: settings.contact.email,
    subject: `New lead for ${settings.contact.tradingName}: ${carLabel}`,
    html: buildLeadEmail(settings, {
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      carLabel,
      preferredContactMethod: payload.preferredContactMethod,
      message: payload.message ?? "",
      source: payload.source,
      landingPage: payload.landingPage,
      referrer: payload.referrer,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      utmTerm: payload.utmTerm,
      utmContent: payload.utmContent,
      gclid: payload.gclid,
      wbraid: payload.wbraid,
      gbraid: payload.gbraid,
    }),
  });

  return NextResponse.json({ success: true });
}
