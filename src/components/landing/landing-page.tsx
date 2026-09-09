"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";

import { QuoteModal } from "@/components/landing/quote-modal";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { TrackingScripts } from "@/components/landing/tracking-scripts";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  buildWhatsAppUrl,
  carDisplayName,
  telHref,
} from "@/lib/business";
import type { LandingData } from "@/lib/server/content";
import { trackEvent } from "@/lib/tracking";
import { applyTemplate, cn, formatPrice } from "@/lib/utils";

type LandingPageProps = LandingData;

export function LandingPage({
  settings,
  cars,
  trustFeatures,
  reviews,
  locations,
  heroMedia,
  ctaMedia,
}: LandingPageProps) {
  const featuredCar = useMemo(
    () => cars.find((car) => car.id === settings.hero.featuredCarId) ?? cars[0] ?? null,
    [cars, settings.hero.featuredCarId],
  );
  const [quoteCarId, setQuoteCarId] = useState<string | null>(featuredCar?.id ?? null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const quoteCar = useMemo(
    () => cars.find((car) => car.id === quoteCarId) ?? featuredCar,
    [cars, featuredCar, quoteCarId],
  );
  const primaryLocation = locations[0] ?? null;
  const featuredCarLabel = featuredCar ? carDisplayName(featuredCar) : "";
  const mapsQuery =
    primaryLocation?.maps_search ||
    settings.contact.mapsSearch ||
    settings.contact.address;
  const mapsUrl =
    primaryLocation?.google_maps_url ||
    settings.contact.mapUrl ||
    buildGoogleMapsDirectionsUrl(mapsQuery);
  const directionsUrl = buildGoogleMapsDirectionsUrl(mapsQuery);
  const phoneHref = telHref(settings.contact.phone);
  const whatsappNumber = settings.contact.whatsappNumber;

  function whatsappHrefFor(carLabel: string) {
    const message = carLabel
      ? applyTemplate(settings.contact.whatsappTemplate, { car_name: carLabel })
      : "";
    return buildWhatsAppUrl(whatsappNumber, message);
  }

  const featuredWhatsappHref = whatsappHrefFor(featuredCarLabel);

  function formatCarPrice(price: number, currency?: string) {
    return formatPrice(price, settings.pricing, currency || "AED");
  }

  function openQuote(carId: string, carLabel: string) {
    setQuoteCarId(carId);
    trackEvent("get_quote_click", { car_name: carLabel, car_id: carId });
    setQuoteOpen(true);
  }

  useEffect(() => {
    trackEvent("page_view", {
      page: "landing",
    });
  }, []);

  useEffect(() => {
    if (!featuredCar) {
      return;
    }

    trackEvent("view_car", {
      car_id: featuredCar.id,
      car_name: featuredCarLabel,
    });
  }, [featuredCar, featuredCarLabel]);

  return (
    <>
      <TrackingScripts gtmId={settings.tracking.gtmId} ga4Id={settings.tracking.ga4Id} />
      <div className="overflow-x-hidden pb-24 lg:pb-0">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080A0B]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
            <a href="#home" className="flex items-center gap-3">
              <Image src="/images/sayarty-logo.png" alt="Sayarty logo" width={164} height={52} priority />
            </a>

            <SiteNav className="hidden items-center gap-8 text-sm text-[#A8AAA8] lg:flex" />

            <div className="hidden items-center gap-3 lg:flex">
              {phoneHref ? (
                <a
                  href={phoneHref}
                  onClick={() => trackEvent("phone_click", { phone: settings.contact.phone })}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium hover:border-[#C9A07F] hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  {settings.contact.phone}
                </a>
              ) : null}
              <a
                href={featuredWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium hover:border-[#C9A07F] hover:text-white"
                onClick={() => trackEvent("whatsapp_click", { car_name: featuredCarLabel })}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {phoneHref ? (
                <a
                  href={phoneHref}
                  onClick={() => trackEvent("phone_click", { phone: settings.contact.phone })}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                  aria-label={`Call ${settings.contact.phone}`}
                >
                  <Phone className="h-4 w-4" />
                </a>
              ) : null}
              <a
                href={featuredWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                aria-label="Chat on WhatsApp"
                onClick={() => trackEvent("whatsapp_click", { car_name: featuredCarLabel })}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
                onClick={() => setMobileMenuOpen((value) => !value)}
                aria-label="Toggle navigation"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen ? (
            <div className="border-t border-white/10 px-4 py-3 lg:hidden">
              <SiteNav
                className="flex flex-col gap-3 text-sm text-[#A8AAA8]"
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          ) : null}
        </header>

        <main className="relative z-10">
          <section id="home" className="bg-hero relative scroll-mt-24 overflow-hidden">
            <div className="hero-cinematic pointer-events-none absolute inset-0" />
            <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-4 lg:px-8 lg:py-8 lg:min-h-[620px] lg:max-w-[min(100%,1600px)] xl:max-w-[min(100%,1760px)] xl:min-h-[min(680px,calc(100svh-5.5rem))] xl:px-8 xl:py-8 2xl:max-w-[min(100%,1800px)] 2xl:min-h-[min(740px,calc(100svh-5.5rem))] 2xl:py-10">
            <div className="relative z-10 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#C9A07F]">{settings.hero.eyebrow}</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-[2.35rem] font-semibold leading-[1.05] md:text-5xl lg:text-[3.5rem]">
                {settings.hero.heading}{" "}
                <span className="text-[#C9A07F]">{settings.hero.highlightedHeading}</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#A8AAA8] md:text-base">
                {settings.hero.description}
              </p>
              {featuredCar ? (
                <div className="mt-5">
                  <h2 className="text-lg font-medium text-white md:text-xl">{featuredCarLabel}</h2>
                  {featuredCar.body_type || featuredCar.transmission ? (
                    <p className="mt-1 text-xs tracking-wide text-[#A8AAA8]">
                      {[featuredCar.body_type, featuredCar.year, featuredCar.transmission].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-[#E4C2A2] md:text-4xl">
                    {formatCarPrice(featuredCar.price, featuredCar.currency)}
                  </p>
                  <p className="mt-1 text-sm text-[#A8AAA8]">{featuredCar.price_label}</p>
                </div>
              ) : null}
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (featuredCar) {
                      openQuote(featuredCar.id, featuredCarLabel);
                    }
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#C9A07F] px-5 text-sm font-medium text-[#080A0B] hover:bg-[#E4C2A2]"
                >
                  {settings.hero.primaryCta}
                </button>
                <a
                  href={featuredWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { car_name: featuredCarLabel })}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-5 text-sm font-medium hover:border-[#C9A07F]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {settings.hero.secondaryCta}
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#A8AAA8]">
                {["Carefully Selected Cars", "Competitive Prices", "UAE Support"].map((item, index) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    {index > 0 ? <span className="hidden h-3 w-px bg-white/15 sm:block" /> : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[#C9A07F]" strokeWidth={2.5} />
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex min-h-[300px] w-full min-w-0 items-center justify-center overflow-hidden sm:min-h-[360px] lg:h-full lg:min-h-0 lg:justify-end lg:overflow-visible lg:pr-4 xl:pr-5 2xl:pr-8">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A07F]/14 blur-[100px] lg:left-auto lg:right-[8%] lg:translate-x-0" />
              {heroMedia?.data_uri ? (
                <Image
                  src={heroMedia.data_uri}
                  alt={settings.hero.heroImageAlt || featuredCarLabel || "Sayarty featured vehicle"}
                  width={1800}
                  height={1100}
                  unoptimized
                  priority
                  className="hero-vehicle relative z-10 left-1/2 h-auto w-[135%] max-w-none -translate-x-1/2 object-contain object-center max-h-[260px] sm:max-h-[420px] md:max-h-[500px] lg:left-auto lg:min-w-0 lg:translate-x-0 lg:w-full lg:max-w-full lg:max-h-[min(62vh,580px)] xl:max-h-[min(66vh,680px)] 2xl:max-h-[min(70vh,740px)]"
                />
              ) : (
                <p className="relative z-10 px-6 text-center text-sm text-[#A8AAA8]">
                  Upload a transparent hero vehicle from Dashboard → Hero.
                </p>
              )}
            </div>
            </div>
          </section>

          <section id="cars" className="bg-offers relative scroll-mt-24">
            <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20 lg:py-[4.5rem]">
            <div className="mb-10 text-center md:mb-12">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#C9A07F]">This month</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#F4F2EE] md:text-[2.35rem]">
                This Month&apos;s Offers
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#A8A5A0]">
                Explore our latest featured cars and get in touch with Sayarty Online for more details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              {cars.map((car) => {
                const label = carDisplayName(car);
                const href = whatsappHrefFor(label);
                const highlightSpecs = [car.body_type, String(car.year), car.transmission].filter(Boolean);

                return (
                  <article
                    key={car.id}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-2xl bg-[#181B1D]",
                      featuredCar?.id === car.id ? "ring-1 ring-[#C9A07F]/40" : "ring-1 ring-white/10",
                    )}
                  >
                    <div className="relative bg-[#101214]">
                      {car.image?.data_uri ? (
                        <Image
                          src={car.image.data_uri}
                          alt={label}
                          width={800}
                          height={560}
                          unoptimized
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-56"
                        />
                      ) : (
                        <div className="flex h-52 flex-col items-center justify-center gap-1 text-sm text-[#A8A5A0] md:h-56">
                          <span>Vehicle Image</span>
                          <span className="text-xs">No image uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                      <h3 className="text-[1.05rem] font-medium leading-snug text-[#F4F2EE]">{label}</h3>
                      {car.colors.length ? (
                        <div className="mt-3 flex gap-2">
                          {car.colors.map((color) => (
                            <span
                              key={color.id}
                              title={color.name}
                              className="h-3.5 w-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: color.hex_code }}
                            />
                          ))}
                        </div>
                      ) : null}
                      {highlightSpecs.length ? (
                        <p className="mt-3 border-t border-white/[0.08] pt-3 text-xs tracking-[0.14em] text-[#A8A5A0]">
                          {highlightSpecs.join("  ·  ")}
                        </p>
                      ) : null}
                      <p className="mt-4 text-2xl font-semibold tracking-tight text-[#E3B995]">
                        {formatCarPrice(car.price, car.currency)}
                      </p>
                      <p className="mt-1 text-xs text-[#A8A5A0]">{car.price_label}</p>
                      <div className="mt-5 grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openQuote(car.id, label)}
                          className="inline-flex h-11 items-center justify-center rounded-full bg-[#C9A07F] px-4 text-sm font-medium text-[#080A0B] hover:bg-[#E3B995]"
                        >
                          Get a Quote
                        </button>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackEvent("whatsapp_click", { car_name: label })}
                          className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-medium text-[#F4F2EE] hover:border-[#C9A07F]"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            </div>
          </section>

          <section className="bg-why">
            <div className="mx-auto grid max-w-[92rem] gap-12 px-4 py-20 md:px-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-end lg:gap-20 lg:py-24">
              <div className="max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#C9A07F]">{settings.why.eyebrow}</p>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-[#F4F2EE] md:text-5xl">
                  {settings.why.heading}
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#A8A5A0] md:text-base">{settings.why.description}</p>
              </div>
              <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {trustFeatures.map((feature, index) => (
                  <div key={feature.id} className="flex gap-5 py-6 md:gap-8 md:py-7">
                    <span className="w-10 shrink-0 font-[family-name:var(--font-display)] text-2xl text-[#C9A07F]/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-[#F4F2EE] md:text-xl">{feature.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#A8A5A0]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {primaryLocation ? (
            <section id="locations" className="bg-location scroll-mt-24">
              <div className="grid lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)] lg:items-stretch">
                <div className="flex flex-col justify-center px-5 py-14 md:px-10 lg:px-14 lg:py-16">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#C9A07F]">Find Us in the UAE</p>
                  <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#F4F2EE] md:text-5xl">
                    {primaryLocation.name}
                  </h2>
                  <p className="mt-6 text-sm text-[#A8A5A0]">
                    {[primaryLocation.city, primaryLocation.country].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#A8A5A0]">{primaryLocation.address}</p>
                  {(primaryLocation.phone || settings.contact.phone) ? (
                    <a
                      href={telHref(primaryLocation.phone || settings.contact.phone)}
                      onClick={() => trackEvent("phone_click", { phone: primaryLocation.phone || settings.contact.phone })}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-[#F4F2EE] hover:text-[#C9A07F]"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#C9A07F]" />
                      {primaryLocation.phone || settings.contact.phone}
                    </a>
                  ) : null}
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("directions_click", { location: primaryLocation.name })}
                    className="mt-8 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#C9A07F] px-6 text-sm font-medium text-[#080A0B] hover:bg-[#E3B995]"
                  >
                    Get Directions
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="map-embed min-h-[280px] overflow-hidden bg-[#0c0e10] lg:min-h-[540px]">
                  <iframe
                    title={`${primaryLocation.name} on Google Maps`}
                    src={buildGoogleMapsEmbedUrl(mapsQuery)}
                    className="h-[280px] w-full border-0 lg:h-full lg:min-h-[540px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section id="reviews" className="bg-reviews relative scroll-mt-24 overflow-hidden">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-6 top-8 select-none font-[family-name:var(--font-display)] text-[14rem] leading-none text-white/[0.035] md:text-[18rem]"
            >
              “
            </span>
            <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
              <div className="mb-10 max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.32em] text-[#C9A07F]">Customer Reviews</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#F4F2EE] md:text-[2.75rem]">
                  What Our Customers Say
                </h2>
                <p className="mt-3 text-sm text-[#A8A5A0]">Real experiences from our customers.</p>
              </div>
              <ReviewsCarousel reviews={reviews} />
            </div>
          </section>

          <section id="contact" className="bg-cta relative scroll-mt-24 overflow-hidden">
            {ctaMedia?.data_uri ? (
              <Image
                src={ctaMedia.data_uri}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(201,160,127,0.16),transparent_42%),linear-gradient(180deg,#17191B_0%,#080A0B_100%)]" />
            )}
            <div className="absolute inset-0 bg-[#080A0B]/72" />
            <div className="relative mx-auto flex min-h-[340px] max-w-4xl flex-col items-start justify-center px-5 py-16 md:min-h-[380px] md:items-center md:px-8 md:text-center lg:min-h-[420px]">
              <p className="text-[11px] uppercase tracking-[0.38em] text-[#C9A07F]">{settings.cta.eyebrow}</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-[#F4F2EE] md:text-5xl">
                {settings.cta.heading}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#A8A5A0] md:text-base">{settings.cta.description}</p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row md:w-auto md:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (featuredCar) {
                      openQuote(featuredCar.id, featuredCarLabel);
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#C9A07F] px-7 text-sm font-medium text-[#080A0B] hover:bg-[#E3B995]"
                >
                  {settings.cta.primaryCta}
                </button>
                <a
                  href={featuredWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { car_name: featuredCarLabel, source: "final_cta" })}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-medium text-white hover:border-[#C9A07F]"
                >
                  {settings.cta.secondaryCta}
                </a>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter
          tradingName={settings.contact.tradingName}
          phone={settings.contact.phone}
          phoneHref={phoneHref}
          whatsappHref={buildWhatsAppUrl(whatsappNumber)}
          address={settings.contact.address}
          city={settings.contact.city}
          country={settings.contact.country}
          mapsUrl={mapsUrl}
          taxNumber={settings.contact.taxNumber}
          agencyUrl={settings.footer.agencyUrl}
        />
      </div>

      <QuoteModal
        car={
          quoteCar
            ? {
                id: quoteCar.id,
                brand: quoteCar.brand,
                name: quoteCar.name,
                display_name: quoteCar.display_name,
                year: quoteCar.year,
                price: quoteCar.price,
                currency: quoteCar.currency,
              }
            : null
        }
        pricing={settings.pricing}
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
      />
      {featuredCar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080A0B]/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
            <a
              href={featuredWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { car_name: featuredCarLabel, source: "mobile_sticky" })}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 text-sm font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => openQuote(featuredCar.id, featuredCarLabel)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#C9A07F] text-sm font-medium text-[#080A0B]"
            >
              Get a Quote
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
