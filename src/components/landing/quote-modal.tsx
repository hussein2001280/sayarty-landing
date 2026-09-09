"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { carDisplayName } from "@/lib/business";
import { trackEvent } from "@/lib/tracking";
import type { PricingSettings } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

type LeadForm = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
  preferredContactMethod: "phone" | "email" | "whatsapp";
};

type QuoteModalProps = {
  car: {
    id: string;
    brand: string;
    name: string;
    display_name?: string | null;
    year: number;
    price: number;
    currency: string;
  } | null;
  pricing?: PricingSettings;
  open: boolean;
  onClose: () => void;
};

function getTrackingParams() {
  if (typeof window === "undefined") {
    return {
      source: "website",
      referrer: "",
      landingPage: "/",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
      gclid: "",
      wbraid: "",
      gbraid: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") || "website",
    referrer: document.referrer || "",
    landingPage: `${window.location.pathname}${window.location.search}`,
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    utmTerm: params.get("utm_term") || "",
    utmContent: params.get("utm_content") || "",
    gclid: params.get("gclid") || "",
    wbraid: params.get("wbraid") || "",
    gbraid: params.get("gbraid") || "",
  };
}

const emptyTrackingParams = {
  source: "website",
  referrer: "",
  landingPage: "/",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  utmContent: "",
  gclid: "",
  wbraid: "",
  gbraid: "",
};

export function QuoteModal({ car, pricing, open, onClose }: QuoteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(emptyTrackingParams);
  const carLabel = car ? carDisplayName(car) : "";

  const form = useFormState();

  useEffect(() => {
    setTracking(getTrackingParams());
  }, []);

  useEffect(() => {
    if (!open || !car) {
      return;
    }

    trackEvent("form_opened", {
      car_name: carLabel,
      car_id: car.id,
    });

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [car, carLabel, onClose, open]);

  if (!open || !car) {
    return null;
  }

  const selectedCar = car;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form.values,
          carId: selectedCar.id,
          ...tracking,
          honeypot: "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to submit your request.");
      }

      trackEvent("form_submitted", {
        car_name: carLabel,
        car_id: selectedCar.id,
      });
      toast.success("Thank you. We've received your request and will contact you shortly.");
      form.reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#111416] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#C9A07F]">Request a Quote</p>
            <h3 id="quote-modal-title" className="mt-2 text-2xl font-semibold text-white">
              Get vehicle details
            </h3>
            <p className="mt-2 text-sm text-[#A8AAA8]">
              {formatPrice(car.price, pricing, car.currency)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/80 hover:bg-white/5"
            aria-label="Close quote form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Selected Vehicle</span>
            <input
              value={carLabel}
              readOnly
              className="h-12 w-full rounded-2xl border border-white/10 px-4 text-white"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[#F5F5F3]">
              <span>Full Name</span>
              <input
                value={form.values.fullName}
                onChange={(event) => form.set("fullName", event.target.value)}
                required
                className="h-12 w-full rounded-2xl border border-white/10 px-4"
                placeholder="Your full name"
              />
            </label>

            <label className="space-y-2 text-sm text-[#F5F5F3]">
              <span>Phone Number</span>
              <input
                value={form.values.phone}
                onChange={(event) => form.set("phone", event.target.value)}
                required
                minLength={8}
                className="h-12 w-full rounded-2xl border border-white/10 px-4"
                placeholder="+971 ..."
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Email</span>
            <input
              type="email"
              value={form.values.email}
              onChange={(event) => form.set("email", event.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-white/10 px-4"
              placeholder="you@example.com"
            />
          </label>

          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Preferred Contact Method</span>
            <select
              value={form.values.preferredContactMethod}
              onChange={(event) =>
                form.set("preferredContactMethod", event.target.value as LeadForm["preferredContactMethod"])
              }
              className="h-12 w-full rounded-2xl border border-white/10 px-4"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Message</span>
            <textarea
              value={form.values.message}
              onChange={(event) => form.set("message", event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-white/10 px-4 py-3"
              placeholder="Tell us anything useful about your request."
            />
          </label>

          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" />

          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B] hover:bg-[#E4C2A2] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Request a Quote"}
          </button>
        </form>
      </div>
    </div>
  );
}

function useFormState() {
  const empty: LeadForm = useMemo(
    () => ({
      fullName: "",
      phone: "",
      email: "",
      message: "",
      preferredContactMethod: "phone",
    }),
    [],
  );
  const [values, setValues] = useState<LeadForm>(empty);

  return {
    values,
    set: <K extends keyof LeadForm>(key: K, value: LeadForm[K]) =>
      setValues((current) => ({ ...current, [key]: value })),
    reset: () => setValues(empty),
  };
}
