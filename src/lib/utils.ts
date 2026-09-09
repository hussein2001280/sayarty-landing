import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  pricing?: { currencyCode?: string; symbolPosition?: "before" | "after" },
  fallbackCurrency = "AED",
) {
  const code = pricing?.currencyCode || fallbackCurrency || "AED";
  const formatted = String(Math.round(Number(amount) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return pricing?.symbolPosition === "after" ? `${formatted} ${code}` : `${code} ${formatted}`;
}

export function formatCurrency(currency: string, price: number) {
  return formatPrice(price, { currencyCode: currency, symbolPosition: "before" });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function applyTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function mergeDefined<T extends object>(base: T, overlay?: Partial<T> | null): T {
  if (!overlay) {
    return base;
  }

  return {
    ...base,
    ...Object.fromEntries(Object.entries(overlay).filter(([, value]) => value !== undefined)),
  } as T;
}
