"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { leadStatuses } from "@/lib/types";

type Lead = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  car_label: string;
  source: string;
  created_at: string;
  status: (typeof leadStatuses)[number];
  message: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  landing_page: string;
  referrer: string;
};

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = [lead.full_name, lead.email, lead.phone, lead.car_label]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      toast.error("Unable to update lead status.");
      return;
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status: status as Lead["status"] } : lead)));
    toast.success("Lead status updated.");
  }

  async function deleteLead(id: string) {
    const response = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete lead.");
      return;
    }

    setLeads((current) => current.filter((lead) => lead.id !== id));
    toast.success("Lead deleted.");
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-3">
          <input
            className="h-11 flex-1 rounded-2xl border border-white/10 px-4"
            placeholder="Search leads"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="h-11 rounded-2xl border border-white/10 px-4"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <form action="/api/admin/leads/export">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#C9A07F] px-5 font-medium text-[#080A0B]"
          >
            Export CSV
          </button>
        </form>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[#A8AAA8]">
            <tr>
              <th className="pb-3">Name</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Car</th>
              <th className="pb-3">Source</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-t border-white/10 align-top">
                <td className="py-4">
                  <p className="font-medium text-white">{lead.full_name}</p>
                  <p className="mt-2 max-w-xs text-xs text-[#A8AAA8]">{lead.message || "No message"}</p>
                </td>
                <td className="py-4">{lead.phone}</td>
                <td className="py-4">{lead.email}</td>
                <td className="py-4">{lead.car_label}</td>
                <td className="py-4">{lead.source}</td>
                <td className="py-4">{new Date(lead.created_at).toLocaleString()}</td>
                <td className="py-4">
                  <select
                    value={lead.status}
                    onChange={(event) => updateStatus(lead.id, event.target.value)}
                    className="h-10 rounded-xl border border-white/10 px-3 capitalize"
                  >
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-[#A8AAA8]">
                    {lead.utm_source || lead.utm_campaign
                      ? `${lead.utm_source} / ${lead.utm_campaign}`
                      : "No UTM data"}
                  </div>
                </td>
                <td className="py-4">
                  <button
                    type="button"
                    onClick={() => deleteLead(lead.id)}
                    className="rounded-full border border-red-500/30 px-4 py-2 text-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
