"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteNav } from "@/components/landing/site-nav";
import { isPlaceholderTaxNumber } from "@/lib/business";
import { trackEvent } from "@/lib/tracking";

const FOOTER_DESCRIPTION =
  "Premium cars, carefully selected offers and dedicated support across the UAE.";

type SiteFooterProps = {
  tradingName: string;
  phone: string;
  phoneHref: string;
  whatsappHref: string;
  address: string;
  city: string;
  country: string;
  mapsUrl: string;
  taxNumber: string;
  agencyUrl: string;
};

function formatAddressLines(address: string) {
  const trimmed = address.trim();
  const separator = trimmed.indexOf(", ");
  if (separator === -1) {
    return trimmed;
  }

  return (
    <>
      {trimmed.slice(0, separator)},
      <br />
      {trimmed.slice(separator + 2)}
    </>
  );
}

export function SiteFooter({
  tradingName,
  phone,
  phoneHref,
  whatsappHref,
  address,
  city,
  country,
  mapsUrl,
  taxNumber,
  agencyUrl,
}: SiteFooterProps) {
  const showTaxNumber = !isPlaceholderTaxNumber(taxNumber);
  const year = new Date().getFullYear();
  const brandName = tradingName.trim();
  const cityLabel = city.trim();
  const countryLabel = country.trim();

  return (
    <footer className="bg-footer border-t border-white/[0.08]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-4 lg:gap-8 lg:py-14">
        <div className="max-w-xs">
          <a href="#home" className="inline-flex">
            <Image src="/images/sayarty-logo.png" alt="Sayarty logo" width={148} height={47} />
          </a>
          <p className="mt-4 text-sm font-medium text-white">{brandName}</p>
          <p className="mt-2 text-sm leading-6 text-[#A8AAA8]">{FOOTER_DESCRIPTION}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Quick Links</h3>
          <div className="mt-3 h-px w-7 bg-[#C9A07F]/70" />
          <SiteNav className="mt-4 flex flex-col gap-2.5 text-sm text-[#A8AAA8] [&_a]:hover:text-white" />
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Contact</h3>
          <div className="mt-3 h-px w-7 bg-[#C9A07F]/70" />
          <div className="mt-4 space-y-3.5 text-sm">
            {phoneHref ? (
              <a
                href={phoneHref}
                onClick={() => trackEvent("phone_click", { phone, source: "footer" })}
                className="group flex items-start gap-2.5 text-[#A8AAA8] hover:text-white"
              >
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A07F]" strokeWidth={1.75} />
                <span>
                  <span className="block text-[11px] tracking-wide text-white/40">Phone</span>
                  <span className="mt-0.5 block">{phone}</span>
                </span>
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("whatsapp_click", { source: "footer" })}
                className="group flex items-start gap-2.5 text-[#A8AAA8] hover:text-white"
              >
                <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A07F]" strokeWidth={1.75} />
                <span>
                  <span className="block text-[11px] tracking-wide text-white/40">WhatsApp</span>
                  <span className="mt-0.5 block">{phone}</span>
                </span>
              </a>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("directions_click", { location: tradingName, source: "footer" })}
                className="group flex items-start gap-2.5 text-[#A8AAA8] hover:text-white"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A07F]" strokeWidth={1.75} />
                <span>
                  <span className="block text-[11px] tracking-wide text-white/40">Location</span>
                  <span className="mt-0.5 block leading-6">{formatAddressLines(address)}</span>
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">{brandName}</h3>
          <div className="mt-3 h-px w-7 bg-[#C9A07F]/70" />
          <div className="mt-4 space-y-2.5 text-sm text-[#A8AAA8]">
            <p>
              {cityLabel}, {countryLabel}
            </p>
            {showTaxNumber ? (
              <p>
                <span className="block text-[11px] tracking-wide text-white/40">Tax Registration Number</span>
                <span className="mt-0.5 block text-white/80">{taxNumber}</span>
              </p>
            ) : null}
            <div className="flex flex-col gap-2 pt-1">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="mx-auto flex min-h-[58px] max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-[#A8AAA8]/70 sm:flex-row sm:items-center md:px-6 lg:min-h-[62px]">
          <p>
            © {year} {brandName}. All rights reserved.
          </p>
          <p>
            Website by{" "}
            <a
              href={agencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A8AAA8]/80 transition-colors hover:text-[#C9A07F]"
            >
              Trendify Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
