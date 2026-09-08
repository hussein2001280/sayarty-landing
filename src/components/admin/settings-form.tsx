"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { SiteSettings } from "@/lib/types";

type MediaOption = {
  id: string;
  file_name: string;
  alt_text: string;
};

export function SettingsForm({
  initialSettings,
  initialTrustFeatures,
  initialLocations,
  initialReviews,
  mediaOptions,
}: {
  initialSettings: SiteSettings;
  initialTrustFeatures: unknown[];
  initialLocations: unknown[];
  initialReviews: unknown[];
  mediaOptions: MediaOption[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [trustJson, setTrustJson] = useState(JSON.stringify(initialTrustFeatures, null, 2));
  const [locationJson, setLocationJson] = useState(JSON.stringify(initialLocations, null, 2));
  const [reviewJson, setReviewJson] = useState(JSON.stringify(initialReviews, null, 2));
  const [saving, setSaving] = useState(false);

  async function uploadFile(
    file: File,
    kind: "hero" | "car" | "location" | "review" | "logo",
    callback: (mediaId: string) => void,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    formData.append("alt", file.name);

    const response = await fetch("/api/media", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Unable to upload file.");
    }

    callback(result.id);
    toast.success("Image uploaded.");
  }

  async function saveAll() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSettings: settings,
          trustFeatures: JSON.parse(trustJson),
          locations: JSON.parse(locationJson),
          reviews: JSON.parse(reviewJson),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save settings.");
      }

      toast.success("Settings saved.");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Hero</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.eyebrow} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, eyebrow: event.target.value } })} placeholder="Eyebrow" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.heroImageAlt} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, heroImageAlt: event.target.value } })} placeholder="Hero image alt text" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.heading} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, heading: event.target.value } })} placeholder="Heading" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.highlightedHeading} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, highlightedHeading: event.target.value } })} placeholder="Highlighted heading" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.primaryCta} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, primaryCta: event.target.value } })} placeholder="Primary CTA" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.secondaryCta} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, secondaryCta: event.target.value } })} placeholder="Secondary CTA" />
        </div>
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={4} value={settings.hero.description} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, description: event.target.value } })} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select className="h-11 rounded-2xl border border-white/10 px-4" value={settings.hero.heroImageId ?? ""} onChange={(event) => setSettings({ ...settings, hero: { ...settings.hero, heroImageId: event.target.value || null } })}>
            <option value="">Select hero image</option>
            {mediaOptions.map((media) => (
              <option key={media.id} value={media.id}>
                {media.file_name}
              </option>
            ))}
          </select>
          <label className="rounded-full border border-white/10 px-5 py-3 text-sm">
            Upload hero image
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.avif"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                await uploadFile(file, "hero", (mediaId) =>
                  setSettings((current) => ({
                    ...current,
                    hero: { ...current.hero, heroImageId: mediaId },
                  })),
                );
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Contact, WhatsApp, Legal</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["tradingName", "Trading name"],
              ["legalName", "Legal business name"],
              ["phone", "Phone"],
              ["email", "Receiving email"],
              ["whatsappNumber", "WhatsApp number"],
              ["taxNumber", "Tax registration number"],
              ["mapUrl", "Google Maps URL"],
              ["openingHours", "Opening hours"],
            ] as const
          ).map(([key, label]) => (
            <input
              key={key}
              className="h-11 rounded-2xl border border-white/10 px-4"
              value={settings.contact[key]}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  contact: { ...settings.contact, [key]: event.target.value },
                })
              }
              placeholder={label}
            />
          ))}
        </div>
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={3} value={settings.contact.description} onChange={(event) => setSettings({ ...settings, contact: { ...settings.contact, description: event.target.value } })} placeholder="Company description" />
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={3} value={settings.contact.address} onChange={(event) => setSettings({ ...settings, contact: { ...settings.contact, address: event.target.value } })} placeholder="Business address" />
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={3} value={settings.contact.whatsappTemplate} onChange={(event) => setSettings({ ...settings, contact: { ...settings.contact, whatsappTemplate: event.target.value } })} placeholder="WhatsApp template with {{car_name}}, {{year}}, {{price}}" />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">SEO and Tracking</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.seo.title} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, title: event.target.value } })} placeholder="SEO title" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.seo.canonicalUrl} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, canonicalUrl: event.target.value } })} placeholder="Canonical URL" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.seo.ogTitle} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, ogTitle: event.target.value } })} placeholder="OG title" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.seo.robots} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, robots: event.target.value } })} placeholder="Robots" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.tracking.gtmId} onChange={(event) => setSettings({ ...settings, tracking: { ...settings.tracking, gtmId: event.target.value } })} placeholder="GTM ID" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.tracking.ga4Id} onChange={(event) => setSettings({ ...settings, tracking: { ...settings.tracking, ga4Id: event.target.value } })} placeholder="GA4 Measurement ID" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.tracking.googleAdsConversionId} onChange={(event) => setSettings({ ...settings, tracking: { ...settings.tracking, googleAdsConversionId: event.target.value } })} placeholder="Google Ads Conversion ID" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.tracking.googleAdsConversionLabel} onChange={(event) => setSettings({ ...settings, tracking: { ...settings.tracking, googleAdsConversionLabel: event.target.value } })} placeholder="Google Ads Conversion Label" />
        </div>
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={3} value={settings.seo.description} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, description: event.target.value } })} placeholder="Meta description" />
        <textarea className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3" rows={3} value={settings.seo.ogDescription} onChange={(event) => setSettings({ ...settings, seo: { ...settings.seo, ogDescription: event.target.value } })} placeholder="OG description" />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Footer and General Settings</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.footer.agencyCredit} onChange={(event) => setSettings({ ...settings, footer: { ...settings.footer, agencyCredit: event.target.value } })} placeholder="Agency credit" />
          <input className="h-11 rounded-2xl border border-white/10 px-4" value={settings.footer.copyrightLine} onChange={(event) => setSettings({ ...settings, footer: { ...settings.footer, copyrightLine: event.target.value } })} placeholder="Copyright line" />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Trust Features</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">Editable JSON array so you can manage title, description, order, and visibility now.</p>
        <textarea className="mt-4 min-h-56 w-full rounded-2xl border border-white/10 px-4 py-3 font-mono text-sm" value={trustJson} onChange={(event) => setTrustJson(event.target.value)} />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Locations</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">Editable JSON array for multiple UAE locations and primary location control.</p>
        <textarea className="mt-4 min-h-56 w-full rounded-2xl border border-white/10 px-4 py-3 font-mono text-sm" value={locationJson} onChange={(event) => setLocationJson(event.target.value)} />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Reviews</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">Editable JSON array. Keep only truthful, approved reviews in production.</p>
        <textarea className="mt-4 min-h-56 w-full rounded-2xl border border-white/10 px-4 py-3 font-mono text-sm" value={reviewJson} onChange={(event) => setReviewJson(event.target.value)} />
      </section>

      <div className="flex justify-end">
        <button onClick={saveAll} disabled={saving} className="h-12 rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B]">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
