import { AdminShell } from "@/components/admin/admin-shell";
import { LocationsManager } from "@/components/admin/locations-manager";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  await requireAdmin();
  await ensureDatabase();

  const locations = await db.selectFrom("locations").selectAll().orderBy("sort_order", "asc").execute();

  return (
    <AdminShell
      title="Locations"
      description="Edit the public location, Google Maps destination, and contact details shown on the landing page."
    >
      <LocationsManager initialLocations={locations} />
    </AdminShell>
  );
}
