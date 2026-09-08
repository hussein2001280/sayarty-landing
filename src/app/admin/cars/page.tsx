import { AdminShell } from "@/components/admin/admin-shell";
import { CarsManager } from "@/components/admin/cars-manager";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  await requireAdmin();
  await ensureDatabase();

  const [cars, media] = await Promise.all([
    db.selectFrom("cars").selectAll().orderBy("sort_order", "asc").execute(),
    db.selectFrom("media").select(["id", "file_name", "alt_text", "data_uri"]).orderBy("created_at", "desc").execute(),
  ]);

  const hydratedCars = await Promise.all(
    cars.map(async (car) => ({
      ...car,
      specs: await db.selectFrom("car_specs").select(["label"]).where("car_id", "=", car.id).orderBy("sort_order", "asc").execute(),
      colors: await db.selectFrom("car_colors").select(["name", "hex_code"]).where("car_id", "=", car.id).orderBy("sort_order", "asc").execute(),
    })),
  );

  return (
    <AdminShell
      title="Cars"
      description="Create, update, reorder, feature, and deactivate monthly offer vehicles."
    >
      <CarsManager initialCars={hydratedCars} mediaOptions={media} />
    </AdminShell>
  );
}
