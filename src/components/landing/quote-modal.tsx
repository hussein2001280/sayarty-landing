"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/tracking";
import { formatCurrency } from "@/lib/utils";

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
    year: number;
    price: number;
    currency: string;
  } | null;
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

export function QuoteModal({ car, open, onClose }: QuoteModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tracking, setTracking] = useState(emptyTrackingParams);
  const carLabel = car ? `${car.brand} ${car.name} ${car.year}` : "";

  const form = useForm<LeadForm>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
      preferredContactMethod: "phone",
    },
  });

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

  async function onSubmit(values: LeadForm) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
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
              {carLabel}
            </h3>
            <p className="mt-2 text-sm text-[#A8AAA8]">
              {formatCurrency(car.currency, car.price)}
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

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[#F5F5F3]">
              <span>Full Name</span>
              <input
                {...form.register("fullName", { required: "Name is required." })}
                className="h-12 w-full rounded-2xl border border-white/10 px-4"
                placeholder="Your full name"
              />
              <span className="text-xs text-red-300">{form.formState.errors.fullName?.message}</span>
            </label>

            <label className="space-y-2 text-sm text-[#F5F5F3]">
              <span>Phone Number</span>
              <input
                {...form.register("phone", { required: "Phone number is required." })}
                className="h-12 w-full rounded-2xl border border-white/10 px-4"
                placeholder="+971 ..."
              />
              <span className="text-xs text-red-300">{form.formState.errors.phone?.message}</span>
            </label>
          </div>

          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Email</span>
            <input
              {...form.register("email", {
                required: "Email is required.",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email address.",
                },
              })}
              className="h-12 w-full rounded-2xl border border-white/10 px-4"
              placeholder="you@example.com"
            />
            <span className="text-xs text-red-300">{form.formState.errors.email?.message}</span>
          </label>

          <label className="space-y-2 text-sm text-[#F5F5F3]">
            <span>Preferred Contact Method</span>
            <select
              {...form.register("preferredContactMethod")}
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
              {...form.register("message")}
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
