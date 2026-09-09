"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { carDisplayName } from "@/lib/business";
import type { SiteSettings } from "@/lib/types";

type CarOption = {
  id: string;
  brand: string;
  name: string;
  year: number;
  display_name?: string;
};

type MediaOption = {
  id: string;
  file_name: string;
  alt_text: string;
  data_uri?: string;
};

export function HeroSettingsForm({
  initialSettings,
  cars,
  mediaOptions,
}: {
  initialSettings: SiteSettings;
  cars: CarOption[];
  mediaOptions: MediaOption[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string>("");

  const heroImage = mediaOptions.find((item) => item.id === settings.hero.heroImageId);
  const featuredCar = cars.find((car) => car.id === settings.hero.featuredCarId);
  const previewSrc = uploadedPreview || heroImage?.data_uri || "";

  async function uploadHeroImage(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "hero");
      formData.append("alt", settings.hero.heroImageAlt || file.name);

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to upload file.");
      }

      setSettings((current) => ({
        ...current,
        hero: {
          ...current.hero,
          heroImageId: result.id,
        },
      }));
      setUploadedPreview(result.data_uri ?? "");
      toast.success("Hero image uploaded. Featured car was not changed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function saveHero() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSettings: settings }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save hero settings.");
      }
      toast.success("Hero settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save hero settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Hero Content</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          These fields control the hero copy, featured car details, and CTA behavior. They do not change the hero image.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Eyebrow</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.eyebrow}
              onChange={(event) =>
                setSettings({ ...settings, hero: { ...settings.hero, eyebrow: event.target.value } })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Heading</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.heading}
              onChange={(event) =>
                setSettings({ ...settings, hero: { ...settings.hero, heading: event.target.value } })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Highlighted Heading</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.highlightedHeading}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, highlightedHeading: event.target.value },
                })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Featured Car</span>
            <select
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.featuredCarId ?? ""}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, featuredCarId: event.target.value || null },
                })
              }
            >
              <option value="">Select featured car</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {carDisplayName(car)}
                </option>
              ))}
            </select>
            <span className="block text-xs text-[#A8AAA8]">
              Current content car: {featuredCar ? carDisplayName(featuredCar) : "None"}
            </span>
          </label>
          <label className="space-y-2 text-sm">
            <span>Primary CTA</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.primaryCta}
              onChange={(event) =>
                setSettings({ ...settings, hero: { ...settings.hero, primaryCta: event.target.value } })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Secondary CTA</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.secondaryCta}
              onChange={(event) =>
                setSettings({ ...settings, hero: { ...settings.hero, secondaryCta: event.target.value } })
              }
            />
          </label>
        </div>
        <label className="mt-4 block space-y-2 text-sm">
          <span>Description</span>
          <textarea
            className="w-full rounded-2xl border border-white/10 px-4 py-3"
            rows={4}
            value={settings.hero.description}
            onChange={(event) =>
              setSettings({ ...settings, hero: { ...settings.hero, description: event.target.value } })
            }
          />
        </label>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Hero Media</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          Upload any transparent PNG or WebP. Changing this image does not change the featured car, and changing the featured car does not replace this image.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Image Alt Text</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={settings.hero.heroImageAlt}
              onChange={(event) =>
                setSettings({ ...settings, hero: { ...settings.hero, heroImageAlt: event.target.value } })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Hero Image</span>
            <div className="flex flex-wrap items-center gap-3">
              <label className="rounded-full border border-white/10 px-5 py-3 text-sm">
                {uploading ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadHeroImage(file);
                    }
                  }}
                />
              </label>
              {settings.hero.heroImageId ? (
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm"
                  onClick={() => {
                    setUploadedPreview("");
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, heroImageId: null },
                    });
                  }}
                >
                  Remove image
                </button>
              ) : null}
            </div>
          </label>
        </div>
        <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-[#080A0B] p-6">
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt={settings.hero.heroImageAlt || "Hero image preview"}
              width={900}
              height={500}
              unoptimized
              className="mx-auto h-auto max-h-[320px] w-auto max-w-full object-contain"
            />
          ) : (
            <p className="text-center text-sm text-[#A8AAA8]">No independent hero image uploaded yet.</p>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={saveHero} disabled={saving} className="h-12 rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B]">
          {saving ? "Saving..." : "Save Hero Settings"}
        </button>
      </div>
    </div>
  );
}
