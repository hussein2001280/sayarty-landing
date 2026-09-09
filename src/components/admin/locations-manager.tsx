"use client";

import { useState } from "react";
import { toast } from "sonner";

import { SAYARTY_BUSINESS, buildGoogleMapsSearchUrl } from "@/lib/business";
import type { LocationRecord } from "@/lib/types";

type LocationDraft = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  maps_search: string;
  google_maps_url: string;
  opening_hours: string;
  active: boolean;
  primary_location: boolean;
  sort_order: number;
};

function toDraft(location: LocationRecord, index: number): LocationDraft {
  return {
    id: location.id,
    name: location.name,
    city: location.city || SAYARTY_BUSINESS.city,
    country: location.country || SAYARTY_BUSINESS.country,
    address: location.address,
    phone: location.phone,
    maps_search: location.maps_search || location.address,
    google_maps_url: location.google_maps_url,
    opening_hours: location.opening_hours ?? "",
    active: Boolean(location.active),
    primary_location: Boolean(location.primary_location),
    sort_order: location.sort_order || index + 1,
  };
}

function emptyLocation(): LocationDraft {
  return {
    id: crypto.randomUUID(),
    name: SAYARTY_BUSINESS.name,
    city: SAYARTY_BUSINESS.city,
    country: SAYARTY_BUSINESS.country,
    address: SAYARTY_BUSINESS.address,
    phone: SAYARTY_BUSINESS.phone,
    maps_search: SAYARTY_BUSINESS.mapsSearch,
    google_maps_url: buildGoogleMapsSearchUrl(SAYARTY_BUSINESS.mapsSearch),
    opening_hours: "",
    active: true,
    primary_location: true,
    sort_order: 1,
  };
}

export function LocationsManager({ initialLocations }: { initialLocations: LocationRecord[] }) {
  const [locations, setLocations] = useState<LocationDraft[]>(
    initialLocations.length > 0 ? initialLocations.map(toDraft) : [emptyLocation()],
  );
  const [saving, setSaving] = useState(false);

  function updateLocation(id: string, patch: Partial<LocationDraft>) {
    setLocations((current) => current.map((location) => (location.id === id ? { ...location, ...patch } : location)));
  }

  async function saveLocations() {
    setSaving(true);
    try {
      const payload = locations.map((location, index) => ({
        ...location,
        maps_search: location.maps_search || location.address,
        google_maps_url:
          location.google_maps_url ||
          buildGoogleMapsSearchUrl(location.maps_search || location.address),
        sort_order: index + 1,
        active: location.active ? 1 : 0,
        primary_location: location.primary_location ? 1 : 0,
        image_id: null,
        latitude: "",
        longitude: "",
      }));

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: payload }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save locations.");
      }
      toast.success("Locations saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save locations.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {locations.map((location, index) => (
        <section key={location.id} className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Location {index + 1}</h2>
            {locations.length > 1 ? (
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-sm"
                onClick={() => setLocations((current) => current.filter((item) => item.id !== location.id))}
              >
                Remove
              </button>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Location Name</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.name}
                onChange={(event) => updateLocation(location.id, { name: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Phone</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.phone}
                onChange={(event) => updateLocation(location.id, { phone: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>City</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.city}
                onChange={(event) => updateLocation(location.id, { city: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Country</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.country}
                onChange={(event) => updateLocation(location.id, { country: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Address</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.address}
                onChange={(event) => updateLocation(location.id, { address: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Google Maps Search / Plus Code</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.maps_search}
                onChange={(event) => {
                  const maps_search = event.target.value;
                  updateLocation(location.id, {
                    maps_search,
                    google_maps_url: buildGoogleMapsSearchUrl(maps_search || location.address),
                  });
                }}
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Google Maps URL</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.google_maps_url}
                onChange={(event) => updateLocation(location.id, { google_maps_url: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span>Opening hours (optional)</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={location.opening_hours}
                onChange={(event) => updateLocation(location.id, { opening_hours: event.target.value })}
                placeholder="Leave empty if not confirmed"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={location.active}
                onChange={(event) => updateLocation(location.id, { active: event.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={location.primary_location}
                onChange={(event) =>
                  setLocations((current) =>
                    current.map((item) => ({
                      ...item,
                      primary_location: item.id === location.id ? event.target.checked : false,
                    })),
                  )
                }
              />
              Primary location
            </label>
          </div>
        </section>
      ))}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          className="h-12 rounded-full border border-white/10 px-6"
          onClick={() =>
            setLocations((current) => [
              ...current,
              { ...emptyLocation(), id: crypto.randomUUID(), primary_location: false, sort_order: current.length + 1 },
            ])
          }
        >
          Add location
        </button>
        <button onClick={saveLocations} disabled={saving} className="h-12 rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B]">
          {saving ? "Saving..." : "Save Locations"}
        </button>
      </div>
    </div>
  );
}
