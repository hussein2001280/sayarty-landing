"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { normalizeWhatsAppNumber } from "@/lib/business";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({
  initialSettings,
  initialTrustFeatures,
  initialReviews,
  ctaPreviewSrc = "",
}: {
  initialSettings: SiteSettings;
  initialTrustFeatures: unknown[];
  initialReviews: unknown[];
  ctaPreviewSrc?: string;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [trustJson, setTrustJson] = useState(JSON.stringify(initialTrustFeatures, null, 2));
  const [reviewJson, setReviewJson] = useState(JSON.stringify(initialReviews, null, 2));
  const [saving, setSaving] = useState(false);
  const [uploadingCta, setUploadingCta] = useState(false);
  const [ctaPreview, setCtaPreview] = useState(ctaPreviewSrc);
  const pricing = settings.pricing ?? { currencyCode: "AED", symbolPosition: "before" as const };
  const why = settings.why;
  const cta = settings.cta;

  async function saveAll() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSettings: {
            ...settings,
            contact: {
              ...settings.contact,
              whatsappNumber: normalizeWhatsAppNumber(settings.contact.whatsappNumber),
            },
          },
          trustFeatures: JSON.parse(trustJson),
          reviews: JSON.parse(reviewJson),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save settings.");
      }

      toast.success("Settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCtaBackground(file: File) {
    setUploadingCta(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "cta");
      formData.append("alt", "Final CTA background");

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
        cta: { ...current.cta, backgroundImageId: result.id },
      }));
      setCtaPreview(result.data_uri ?? "");
      toast.success("CTA background uploaded. Save settings to keep it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload file.");
    } finally {
      setUploadingCta(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Contact, WhatsApp, Legal</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["tradingName", "Business / trading name"],
              ["legalName", "Legal business name"],
              ["phone", "Phone"],
              ["email", "Receiving email"],
              ["whatsappNumber", "WhatsApp number"],
              ["city", "City"],
              ["country", "Country"],
              ["taxNumber", "Tax registration number"],
              ["mapsSearch", "Google Maps search / Plus Code"],
              ["mapUrl", "Google Maps URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="space-y-2 text-sm">
              <span>{label}</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={settings.contact[key]}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, [key]: event.target.value },
                  })
                }
                placeholder={label}
              />
            </label>
          ))}
        </div>
        <label className="mt-4 block space-y-2 text-sm">
          <span>Company description</span>
          <textarea
            className="w-full rounded-2xl border border-white/10 px-4 py-3"
            rows={3}
            value={settings.contact.description}
            onChange={(event) =>
              setSettings({ ...settings, contact: { ...settings.contact, description: event.target.value } })
            }
          />
        </label>
        <label className="mt-4 block space-y-2 text-sm">
          <span>Address</span>
          <textarea
            className="w-full rounded-2xl border border-white/10 px-4 py-3"
            rows={3}
            value={settings.contact.address}
            onChange={(event) =>
              setSettings({ ...settings, contact: { ...settings.contact, address: event.target.value } })
            }
          />
        </label>
        <label className="mt-4 block space-y-2 text-sm">
          <span>WhatsApp template</span>
          <textarea
            className="w-full rounded-2xl border border-white/10 px-4 py-3"
            rows={3}
            value={settings.contact.whatsappTemplate}
            onChange={(event) =>
              setSettings({
                ...settings,
                contact: { ...settings.contact, whatsappTemplate: event.target.value },
              })
            }
            placeholder="Use {{car_name}} for the selected vehicle"
          />
        </label>
      </section>

      <section id="legal" className="scroll-mt-6 rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Legal Information</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          Keep the tax registration number empty or as a placeholder until the real number is available. Do not invent one.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["legalName", "Business name"],
              ["country", "Country"],
              ["city", "City"],
              ["taxNumber", "Tax registration number"],
            ] as const
          ).map(([key, label]) => (
            <label key={`legal-${key}`} className="space-y-2 text-sm">
              <span>{label}</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={settings.contact[key]}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    contact: { ...settings.contact, [key]: event.target.value },
                  })
                }
                placeholder={key === "taxNumber" ? "TAX NUMBER TO BE ADDED" : label}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Pricing</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          Currency formatting is centralized here so landing page prices can be changed later without editing every card.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Currency code</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={pricing.currencyCode}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  pricing: { ...pricing, currencyCode: event.target.value.toUpperCase() },
                })
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Symbol position</span>
            <select
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={pricing.symbolPosition}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  pricing: {
                    ...pricing,
                    symbolPosition: event.target.value as "before" | "after",
                  },
                })
              }
            >
              <option value="before">Before amount (AED 79,900)</option>
              <option value="after">After amount (79,900 AED)</option>
            </select>
          </label>
        </div>
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
        <h2 className="text-xl font-semibold text-white">Why Sayarty</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">Editorial copy for the Why section. Trust points below remain separately editable.</p>
        <div className="mt-5 grid gap-4">
          <label className="space-y-2 text-sm">
            <span>Eyebrow</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={why.eyebrow}
              onChange={(event) => setSettings({ ...settings, why: { ...why, eyebrow: event.target.value } })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Heading</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={why.heading}
              onChange={(event) => setSettings({ ...settings, why: { ...why, heading: event.target.value } })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Description</span>
            <textarea
              className="w-full rounded-2xl border border-white/10 px-4 py-3"
              rows={3}
              value={why.description}
              onChange={(event) => setSettings({ ...settings, why: { ...why, description: event.target.value } })}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Final CTA</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          Full-width cinematic closer. Upload a dark automotive background if you have one. Leave empty to use the default dark treatment.
        </p>
        <div className="mt-5 grid gap-4">
          <label className="space-y-2 text-sm">
            <span>Eyebrow</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={cta.eyebrow}
              onChange={(event) => setSettings({ ...settings, cta: { ...cta, eyebrow: event.target.value } })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Heading</span>
            <input
              className="h-11 w-full rounded-2xl border border-white/10 px-4"
              value={cta.heading}
              onChange={(event) => setSettings({ ...settings, cta: { ...cta, heading: event.target.value } })}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Description</span>
            <textarea
              className="w-full rounded-2xl border border-white/10 px-4 py-3"
              rows={3}
              value={cta.description}
              onChange={(event) => setSettings({ ...settings, cta: { ...cta, description: event.target.value } })}
            />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>Primary button</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={cta.primaryCta}
                onChange={(event) => setSettings({ ...settings, cta: { ...cta, primaryCta: event.target.value } })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>Secondary button</span>
              <input
                className="h-11 w-full rounded-2xl border border-white/10 px-4"
                value={cta.secondaryCta}
                onChange={(event) => setSettings({ ...settings, cta: { ...cta, secondaryCta: event.target.value } })}
              />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span>Background image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              disabled={uploadingCta}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadCtaBackground(file);
                }
              }}
            />
          </label>
          {cta.backgroundImageId ? (
            <button
              type="button"
              className="h-11 w-fit rounded-full border border-white/10 px-4 text-sm"
              onClick={() => {
                setSettings({ ...settings, cta: { ...cta, backgroundImageId: null } });
                setCtaPreview("");
              }}
            >
              Remove background image
            </button>
          ) : null}
          {ctaPreview ? (
            <Image src={ctaPreview} alt="CTA background preview" width={640} height={280} unoptimized className="max-h-40 w-full rounded-2xl object-cover" />
          ) : (
            <p className="text-sm text-[#A8AAA8]">No background uploaded. The landing page will use a dark cinematic placeholder.</p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Footer and Agency Credit</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Agency credit</span>
            <input className="h-11 w-full rounded-2xl border border-white/10 px-4" value={settings.footer.agencyCredit} onChange={(event) => setSettings({ ...settings, footer: { ...settings.footer, agencyCredit: event.target.value } })} />
          </label>
          <label className="space-y-2 text-sm">
            <span>Trendify Agency URL</span>
            <input className="h-11 w-full rounded-2xl border border-white/10 px-4" value={settings.footer.agencyUrl} onChange={(event) => setSettings({ ...settings, footer: { ...settings.footer, agencyUrl: event.target.value } })} />
          </label>
          <label className="space-y-2 text-sm lg:col-span-2">
            <span>Copyright line</span>
            <input className="h-11 w-full rounded-2xl border border-white/10 px-4" value={settings.footer.copyrightLine} onChange={(event) => setSettings({ ...settings, footer: { ...settings.footer, copyrightLine: event.target.value } })} />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Trust Features</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">Editable JSON array so you can manage title, description, order, and visibility now.</p>
        <textarea className="mt-4 min-h-56 w-full rounded-2xl border border-white/10 px-4 py-3 font-mono text-sm" value={trustJson} onChange={(event) => setTrustJson(event.target.value)} />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
        <h2 className="text-xl font-semibold text-white">Reviews</h2>
        <p className="mt-2 text-sm text-[#A8AAA8]">
          Edit customer names, ratings, and review text here. The landing page shows published reviews in this order. Do not add verification badges unless you have verification data.
        </p>
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
