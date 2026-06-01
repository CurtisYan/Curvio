"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function getShortcutLabel(isMac: boolean) {
  return isMac ? "Cmd K" : "Ctrl K";
}

export function SearchTrigger({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
    setIsMac(/mac/i.test(platform));
  }, []);

  return (
    <Link
      aria-label={label}
      className={cn(
        "hidden h-11 w-full max-w-md items-center justify-between gap-3 rounded-full border border-border-subtle bg-surface-offwhite px-4 text-sm text-muted shadow-[0_1px_0_rgba(255,255,255,0.5)_inset] transition-colors hover:border-primary/30 hover:bg-surface-container-low hover:text-primary md:flex",
        className,
      )}
      href={localizePath(locale, "/explore")}
    >
      <span className="flex min-w-0 items-center gap-3">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <span className="truncate">{label}</span>
      </span>
      <kbd className="inline-flex items-center rounded-full border border-border-subtle bg-surface px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted">
        {getShortcutLabel(isMac)}
      </kbd>
    </Link>
  );
}