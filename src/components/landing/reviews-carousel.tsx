"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { cn } from "@/lib/utils";

type ReviewCard = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  photo?: { data_uri?: string | null } | null;
};

const PREVIEW_LENGTH = 170;

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function previewText(text: string) {
  if (text.length <= PREVIEW_LENGTH) {
    return text;
  }

  const slice = text.slice(0, PREVIEW_LENGTH);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 120 ? lastSpace : PREVIEW_LENGTH).trim()}…`;
}

export function ReviewsCarousel({ reviews }: { reviews: ReviewCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  function updatePage() {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector("article");
    if (!scroller || !card) {
      return;
    }

    const width = card.getBoundingClientRect().width + 16;
    setPage(Math.round(scroller.scrollLeft / Math.max(width, 1)));
  }

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    updatePage();
    scroller.addEventListener("scroll", updatePage, { passive: true });
    window.addEventListener("resize", updatePage);
    return () => {
      scroller.removeEventListener("scroll", updatePage);
      window.removeEventListener("resize", updatePage);
    };
  }, [reviews.length]);

  function scrollByCard(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector("article");
    if (!scroller || !card) {
      return;
    }

    const width = card.getBoundingClientRect().width + 16;
    scroller.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  if (!reviews.length) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => {
          const expanded = Boolean(expandedIds[review.id]);
          const needsPreview = review.review_text.length > PREVIEW_LENGTH;
          const text = expanded || !needsPreview ? review.review_text : previewText(review.review_text);
          const photoSrc = review.photo?.data_uri;
          const initials = initialsFromName(review.customer_name);

          return (
            <article
              key={review.id}
              className="w-full shrink-0 snap-start rounded-xl bg-[#1B1E20] p-5 ring-1 ring-white/10 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
            >
              <div className="flex items-center gap-3">
                {photoSrc ? (
                  <Image
                    src={photoSrc}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#C9A07F]/12 text-xs font-medium tracking-[0.16em] text-[#E3B995]">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-white">{review.customer_name}</h3>
                  <div className="mt-1 flex text-[#C9A07F]" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#A8A5A0]">{text}</p>
              {needsPreview ? (
                <button
                  type="button"
                  className="mt-3 text-sm text-[#C9A07F] hover:text-[#E4C2A2]"
                  onClick={() =>
                    setExpandedIds((current) => ({
                      ...current,
                      [review.id]: !current[review.id],
                    }))
                  }
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      {reviews.length > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {reviews.map((review, index) => (
              <span
                key={review.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full bg-white/20",
                  index === page && "w-4 bg-[#C9A07F]",
                )}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 hover:border-[#C9A07F]"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/80 hover:border-[#C9A07F]"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
