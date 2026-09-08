import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

export async function GET() {
  await requireAdmin();
  await ensureDatabase();

  const leads = await db.selectFrom("leads").selectAll().orderBy("created_at", "desc").execute();

  const header = [
    "Name",
    "Phone",
    "Email",
    "Car",
    "Source",
    "Status",
    "Date",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Term",
    "UTM Content",
    "GCLID",
    "WBRAID",
    "GBRAID",
    "Landing Page",
    "Referrer",
    "Message",
  ];

  const rows = leads.map((lead) =>
    [
      lead.full_name,
      lead.phone,
      lead.email,
      lead.car_label,
      lead.source,
      lead.status,
      lead.created_at,
      lead.utm_source,
      lead.utm_medium,
      lead.utm_campaign,
      lead.utm_term,
      lead.utm_content,
      lead.gclid,
      lead.wbraid,
      lead.gbraid,
      lead.landing_page,
      lead.referrer,
      lead.message.replaceAll('"', '""'),
    ]
      .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );

  return new NextResponse([header.join(","), ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sayarty-leads.csv"',
    },
  });
}
