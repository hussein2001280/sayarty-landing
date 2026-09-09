"use client";

import type { MouseEvent } from "react";

const NAV_ITEMS = [
  { href: "#home", label: "Home" },
  { href: "#cars", label: "Our Cars" },
  { href: "#locations", label: "Locations" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const id = href.replace("#", "");
    const section = document.getElementById(id);

    if (!section) {
      return;
    }

    event.preventDefault();
    onNavigate?.();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <nav className={className}>
      {NAV_ITEMS.map((item) => (
        <a key={item.href} href={item.href} onClick={(event) => handleClick(event, item.href)}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export { NAV_ITEMS };
