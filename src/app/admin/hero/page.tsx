import { AdminShell } from "@/components/admin/admin-shell";
import { HeroSettingsForm } from "@/components/admin/hero-settings-form";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase, getSiteSettings } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  await requireAdmin();
  await ensureDatabase();

  const [settings, cars, media] = await Promise.all([
    getSiteSettings(),
    db.selectFrom("cars").select(["id", "brand", "name", "year", "display_name"]).orderBy("sort_order", "asc").execute(),
    db.selectFrom("media").select(["id", "file_name", "alt_text", "data_uri"]).orderBy("created_at", "desc").execute(),
  ]);

  return (
    <AdminShell
      title="Hero"
      description="Hero content and hero media are independent. Changing the featured car never replaces the uploaded hero image."
    >
      <HeroSettingsForm initialSettings={settings} cars={cars} mediaOptions={media} />
    </AdminShell>
  );
}
