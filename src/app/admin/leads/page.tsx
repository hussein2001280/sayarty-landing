import { AdminShell } from "@/components/admin/admin-shell";
import { LeadsTable } from "@/components/admin/leads-table";
import { requireAdmin } from "@/lib/server/auth";
import { db, ensureDatabase } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdmin();
  await ensureDatabase();

  const leads = await db.selectFrom("leads").selectAll().orderBy("created_at", "desc").execute();

  return (
    <AdminShell
      title="Leads"
      description="Track quote requests, update sales status, and export campaign-ready CSV reports."
    >
      <LeadsTable initialLeads={leads} />
    </AdminShell>
  );
}
