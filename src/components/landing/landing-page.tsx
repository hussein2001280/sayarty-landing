"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Headset,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Star,
  Tag,
  X,
} from "lucide-react";

import { QuoteModal } from "@/components/landing/quote-modal";
import { TrackingScripts } from "@/components/landing/tracking-scripts";
import type { LandingData } from "@/lib/server/content";
import { trackEvent } from "@/lib/tracking";
import { applyTemplate, cn, formatCurrency } from "@/lib/utils";

type LandingPageProps = LandingData;

const iconMap = {
  shield: ShieldCheck,
  "badge-dollar-sign": Tag,
  headset: Headset,
  "map-pinned": MapPin,
} as const;

export function LandingPage({
  settings,
  cars,
  trustFeatures,
  reviews,
  locations,
  heroMedia,
}: LandingPageProps) {
  const [activeCarId, setActiveCarId] = useState<string | null>(cars[0]?.id ?? null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCar = useMemo(
    () => cars.find((car) => car.id === activeCarId) ?? cars[0] ?? null,
    [cars, activeCarId],
  );

  const primaryLocation = locations[0] ?? null;
  const activeCarLabel = activeCar ? `${activeCar.brand} ${activeCar.name} ${activeCar.year}` : "";

  const whatsappHref = activeCar
    ? `https://wa.me/${settings.contact.whatsappNumber}?text=${encodeURIComponent(
        applyTemplate(settings.contact.whatsappTemplate, {
          car_name: `${activeCar.brand} ${activeCar.name}`,
          year: activeCar.year,
          price: formatCurrency(activeCar.currency, activeCar.price),
        }),
      )}`
    : `https://wa.me/${settings.contact.whatsappNumber}`;

  useEffect(() => {
    trackEvent("page_view", {
      page: "landing",
    });
  }, []);

  useEffect(() => {
    if (!activeCar) {
      return;
    }

    trackEvent("view_car", {
      car_id: activeCar.id,
      car_name: activeCarLabel,
    });
  }, [activeCar, activeCarLabel]);

  return (
    <>
      <TrackingScripts gtmId={settings.tracking.gtmId} ga4Id={settings.tracking.ga4Id} />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,160,127,0.3),transparent_35%),radial-gradient(circle_at_top_left,rgba(201,160,127,0.12),transparent_30%)]" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080A0B]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/sayarty-logo.png" alt="Sayarty logo" width={164} height={52} priority />
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-[#A8AAA8] lg:flex">
              <a href="#home">Home</a>
              <a href="#cars">Our Cars</a>
              <a href="#locations">Locations</a>
              <a href="#reviews">Reviews</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium hover:border-[#C9A07F] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Us
              </a>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                onClick={() => setMobileMenuOpen((value) => !value)}
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
              <div className="flex flex-col gap-3 text-sm text-[#A8AAA8]">
                <a href="#home">Home</a>
                <a href="#cars">Our Cars</a>
                <a href="#locations">Locations</a>
                <a href="#reviews">Reviews</a>
                <a href="#contact">Contact</a>
              </div>
            </nav>
          ) : null}
        </header>

        <main className="relative z-10">
          <section id="home" className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#C9A07F]">{settings.hero.eyebrow}</p>
              <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight md:text-6xl">
                {settings.hero.heading}{" "}
                <span className="text-[#C9A07F]">{settings.hero.highlightedHeading}</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#A8AAA8] md:text-lg">
                {settings.hero.description}
              </p>
              {activeCar ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-[#A8AAA8]">Featured this month</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {activeCar.brand} {activeCar.name} {activeCar.year}
                  </h2>
                  <p className="mt-2 text-sm text-[#A8AAA8]">{activeCar.description}</p>
                  <p className="mt-4 text-2xl font-semibold text-[#E4C2A2]">
                    {activeCar.price_label} {formatCurrency(activeCar.currency, activeCar.price)}
                  </p>
                </div>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCar) {
                      setActiveCarId(activeCar.id);
                      trackEvent("get_quote_click", { car_name: activeCarLabel, car_id: activeCar.id });
                      setQuoteOpen(true);
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B] hover:bg-[#E4C2A2]"
                >
                  {settings.hero.primaryCta}
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { car_name: activeCarLabel })}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 font-medium hover:border-[#C9A07F]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {settings.hero.secondaryCta}
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-sm text-[#A8AAA8]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Trusted Car Dealer</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Competitive Prices</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">Across the UAE</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 bottom-10 top-10 rounded-full bg-[#C9A07F]/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6">
                {heroMedia?.data_uri ? (
                  <Image
                    src={heroMedia.data_uri}
                    alt={settings.hero.heroImageAlt}
                    width={1200}
                    height={700}
                    unoptimized
                    className="mx-auto h-auto max-h-[520px] w-full object-contain"
                  />
                ) : activeCar?.image?.data_uri ? (
                  <Image
                    src={activeCar.image.data_uri}
                    alt={`${activeCar.brand} ${activeCar.name} ${activeCar.year}`}
                    width={1200}
                    height={700}
                    unoptimized
                    className="mx-auto h-auto max-h-[520px] w-full object-contain"
                  />
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/15 text-center text-[#A8AAA8]">
                    Upload a transparent hero vehicle from the admin dashboard.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="cars" className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-[#C9A07F]">This Month&apos;s Offers</p>
              <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Featured Cars</h2>
              <p className="mt-3 text-[#A8AAA8]">Carefully selected cars built for high-intent campaign traffic.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {cars.map((car) => {
                const label = `${car.brand} ${car.name} ${car.year}`;
                const href = `https://wa.me/${settings.contact.whatsappNumber}?text=${encodeURIComponent(
                  applyTemplate(settings.contact.whatsappTemplate, {
                    car_name: `${car.brand} ${car.name}`,
                    year: car.year,
                    price: formatCurrency(car.currency, car.price),
                  }),
                )}`;

                return (
                  <article
                    key={car.id}
                    className={cn(
                      "group rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]",
                      activeCarId === car.id && "border-[#C9A07F]/50",
                    )}
                  >
                    <button type="button" className="w-full text-left" onClick={() => setActiveCarId(car.id)}>
                      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0D1012]">
                        {car.image?.data_uri ? (
                          <Image
                            src={car.image.data_uri}
                            alt={label}
                            width={800}
                            height={560}
                            unoptimized
                            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-56 items-center justify-center text-sm text-[#A8AAA8]">
                            Upload vehicle image
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="mt-4">
                      <h3 className="text-xl font-semibold text-white">{label}</h3>
                      <div className="mt-3 flex gap-2">
                        {car.colors.map((color) => (
                          <span
                            key={color.id}
                            title={color.name}
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: color.hex_code }}
                          />
                        ))}
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-[#A8AAA8]">
                        {car.specs.slice(0, 4).map((spec) => (
                          <li key={spec.id} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A07F]" />
                            {spec.label}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 text-2xl font-semibold text-[#E4C2A2]">
                        {car.price_label} {formatCurrency(car.currency, car.price)}
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCarId(car.id);
                            trackEvent("get_quote_click", { car_name: label, car_id: car.id });
                            setQuoteOpen(true);
                          }}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-[#C9A07F] px-4 text-sm font-medium text-[#080A0B] hover:bg-[#E4C2A2]"
                        >
                          Get a Quote
                        </button>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackEvent("whatsapp_click", { car_name: label })}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-medium hover:border-[#C9A07F]"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-[#C9A07F]">Why Sayarty</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">A Better Way to Buy Your Next Car</h2>
                <p className="mt-4 max-w-xl text-[#A8AAA8]">
                  Keep the offer clear, the pricing transparent, and the conversation easy. That is what makes paid traffic convert.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {trustFeatures.map((feature) => {
                  const Icon = iconMap[feature.icon as keyof typeof iconMap] ?? ShieldCheck;
                  return (
                    <div key={feature.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                      <Icon className="h-6 w-6 text-[#C9A07F]" />
                      <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#A8AAA8]">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {primaryLocation ? (
            <section id="locations" className="mx-auto max-w-7xl px-4 py-8 md:px-6">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#C9A07F]">Find Us in the UAE</p>
                  <h2 className="mt-4 text-3xl font-semibold text-white">{primaryLocation.name}</h2>
                  <p className="mt-4 whitespace-pre-line text-[#A8AAA8]">{primaryLocation.address}</p>
                  <p className="mt-3 text-[#A8AAA8]">{primaryLocation.phone}</p>
                  <p className="mt-3 text-[#A8AAA8]">{primaryLocation.opening_hours}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {primaryLocation.google_maps_url ? (
                      <a
                        href={primaryLocation.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackEvent("directions_click", { location: primaryLocation.name })}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9A07F] px-6 font-medium text-[#080A0B]"
                      >
                        Get Directions
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    <a
                      href={`tel:${settings.contact.phone.replace(/\s+/g, "")}`}
                      onClick={() => trackEvent("phone_click", { phone: settings.contact.phone })}
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-6 font-medium"
                    >
                      Call Now
                    </a>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#111416,#0D1012)] p-6">
                    <div className="flex h-full min-h-[260px] items-end rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(201,160,127,0.15),transparent_45%)] p-4">
                      <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                        <p className="text-sm text-[#A8AAA8]">Primary location</p>
                        <p className="mt-1 font-medium text-white">{primaryLocation.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
                    {primaryLocation.image?.data_uri ? (
                      <Image
                        src={primaryLocation.image.data_uri}
                        alt={primaryLocation.name}
                        width={900}
                        height={700}
                        unoptimized
                        className="h-full min-h-[260px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex min-h-[260px] items-center justify-center p-6 text-center text-[#A8AAA8]">
                        Upload a showroom image from the dashboard.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section id="reviews" className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-[#C9A07F]">Customer Reviews</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">What People Say About Sayarty</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{review.customer_name}</h3>
                      <p className="mt-1 text-sm text-[#A8AAA8]">Editable demo review</p>
                    </div>
                    <div className="flex text-[#C9A07F]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#A8AAA8]">{review.review_text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(201,160,127,0.16),rgba(17,20,22,0.95))] p-8 md:p-10">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Ready to Find Your Next Car?</h2>
              <p className="mt-3 max-w-2xl text-[#F5F5F3]/80">
                Get a quote or start the conversation on WhatsApp. Keep the path short, fast, and transparent.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCar) {
                      setActiveCarId(activeCar.id);
                      trackEvent("get_quote_click", { car_name: activeCarLabel, car_id: activeCar.id });
                      setQuoteOpen(true);
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#080A0B] px-6 font-medium text-white"
                >
                  Get a Quote
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { car_name: activeCarLabel })}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 font-medium text-white"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </section>
        </main>

        <footer id="contact" className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_0.8fr_0.8fr_1fr]">
            <div>
              <Image src="/images/sayarty-logo.png" alt="Sayarty logo" width={164} height={52} />
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#A8AAA8]">{settings.contact.description}</p>
            </div>
            <div>
              <h3 className="font-medium text-white">Quick Links</h3>
              <div className="mt-4 flex flex-col gap-2 text-sm text-[#A8AAA8]">
                <a href="#home">Home</a>
                <a href="#cars">Our Cars</a>
                <a href="#locations">Locations</a>
                <a href="#reviews">Reviews</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white">Contact Information</h3>
              <div className="mt-4 space-y-2 text-sm text-[#A8AAA8]">
                <p>{settings.contact.address}</p>
                <p>{settings.contact.phone}</p>
                <p>{settings.contact.email}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white">Legal Information</h3>
              <div className="mt-4 space-y-2 text-sm text-[#A8AAA8]">
                <p>{settings.contact.legalName}</p>
                <p>{settings.contact.taxNumber}</p>
                <p>{settings.contact.address}</p>
                <p>{settings.footer.agencyCredit}</p>
              </div>
            </div>
          </div>
          <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-4 py-5 text-sm text-[#A8AAA8] md:flex-row md:items-center md:justify-between md:px-6">
            <p>{settings.footer.copyrightLine}</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>

      <QuoteModal
        car={
          activeCar
            ? {
                id: activeCar.id,
                brand: activeCar.brand,
                name: activeCar.name,
                year: activeCar.year,
                price: activeCar.price,
                currency: activeCar.currency,
              }
            : null
        }
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
    </>
  );
}
