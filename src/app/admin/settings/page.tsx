import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase, getSiteSettings } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  await ensureDatabase();

  const [settings, trustFeatures, reviews] = await Promise.all([
    getSiteSettings(),
    db.selectFrom("trust_features").selectAll().orderBy("sort_order", "asc").execute(),
    db.selectFrom("reviews").selectAll().orderBy("sort_order", "asc").execute(),
  ]);

  const ctaMedia = settings.cta.backgroundImageId
    ? await db
        .selectFrom("media")
        .select(["data_uri"])
        .where("id", "=", settings.cta.backgroundImageId)
        .executeTakeFirst()
    : null;

  return (
    <AdminShell
      title="Settings"
      description="Manage contact details, legal information, SEO, tracking IDs, reviews, and trust features."
    >
      <SettingsForm
        initialSettings={settings}
        initialTrustFeatures={trustFeatures}
        initialReviews={reviews}
        ctaPreviewSrc={ctaMedia?.data_uri ?? ""}
      />
    </AdminShell>
  );
}
