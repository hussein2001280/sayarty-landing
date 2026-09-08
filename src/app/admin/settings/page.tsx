import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase, getSiteSettings } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  await ensureDatabase();

  const [settings, trustFeatures, locations, reviews, media] = await Promise.all([
    getSiteSettings(),
    db.selectFrom("trust_features").selectAll().orderBy("sort_order", "asc").execute(),
    db.selectFrom("locations").selectAll().orderBy("sort_order", "asc").execute(),
    db.selectFrom("reviews").selectAll().orderBy("sort_order", "asc").execute(),
    db.selectFrom("media").select(["id", "file_name", "alt_text"]).orderBy("created_at", "desc").execute(),
  ]);

  return (
    <AdminShell
      title="Settings"
      description="Manage hero content, contact details, SEO, tracking IDs, reviews, trust features, and locations."
    >
      <SettingsForm
        initialSettings={settings}
        initialTrustFeatures={trustFeatures}
        initialLocations={locations}
        initialReviews={reviews}
        mediaOptions={media}
      />
    </AdminShell>
  );
}
