import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function WarrantyBadge({
  warranty,
  className,
}: {
  warranty?: string | null;
  className?: string;
}) {
  const label = warranty?.trim();
  if (!label) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#C9A07F]/45 bg-[#080A0B]/78 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-[#E4C2A2] shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#C9A07F]" strokeWidth={2.25} />
      <span className="truncate">{label}</span>
    </span>
  );
}
