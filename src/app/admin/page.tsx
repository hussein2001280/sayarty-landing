import { AdminShell } from "@/components/admin/admin-shell";
import { getOverviewData } from "@/lib/server/content";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const data = await getOverviewData();

  return (
    <AdminShell
      title="Overview"
      description="Monitor leads, campaign performance, and the monthly landing page workflow."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total Leads", data.metrics.totalLeads],
          ["New Leads", data.metrics.newLeads],
          ["Contacted", data.metrics.contactedLeads],
          ["Qualified", data.metrics.qualifiedLeads],
          ["Closed", data.metrics.closedLeads],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[28px] border border-white/10 bg-[#111416] p-5">
            <p className="text-sm text-[#A8AAA8]">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
          <h2 className="text-xl font-semibold text-white">Top Cars by Leads</h2>
          <div className="mt-4 space-y-4">
            {data.topCars.map((car) => (
              <div key={car.label} className="flex items-center justify-between rounded-2xl border border-white/10 p-4">
                <span>{car.label}</span>
                <span className="text-[#C9A07F]">{car.leads}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
          <h2 className="text-xl font-semibold text-white">Recent Leads</h2>
          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[#A8AAA8]">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Car</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10">
                    <td className="py-3">{lead.full_name}</td>
                    <td className="py-3">{lead.car_label}</td>
                    <td className="py-3 capitalize">{lead.status}</td>
                    <td className="py-3">{new Date(lead.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
