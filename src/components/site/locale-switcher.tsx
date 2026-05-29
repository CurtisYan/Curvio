"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const details = detailsRef.current;
      if (!details || !details.open) {
        return;
      }

      if (event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  function pathFor(targetLocale: Locale) {
    const parts = pathname.split("/");

    if (locales.includes(parts[1] as Locale)) {
      parts[1] = targetLocale;
    } else {
      parts.splice(1, 0, targetLocale);
    }

    return parts.join("/") || `/${targetLocale}`;
  }

  return (
    <details className="group relative" ref={detailsRef}>
      <summary
        aria-label={label}
        className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-lg border border-transparent px-2 text-sm font-medium text-muted transition-colors hover:border-border-subtle hover:bg-surface-offwhite hover:text-primary [&::-webkit-details-marker]:hidden"
      >
        <span className="font-sans text-[15px] leading-none">A</span>
        <span className="h-4 w-px rotate-12 bg-border-subtle" />
        <span className="font-sans text-[15px] leading-none">文</span>
      </summary>
      <div className="absolute right-0 top-11 z-50 w-40 overflow-hidden rounded-xl border border-border-subtle bg-surface-offwhite p-1 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
        {locales.map((item) => (
          <Link
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-container-low hover:text-primary",
              item === locale ? "text-primary" : "text-muted",
            )}
            href={pathFor(item)}
            key={item}
          >
            {item === "en" ? "English" : "中文"}
          </Link>
        ))}
      </div>
    </details>
  );
}
