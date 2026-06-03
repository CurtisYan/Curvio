import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

export function DashboardNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    all: string;
    donations: string;
    acts: string;
    openWork: string;
  };
}) {
  const items = [
    { href: "/dashboard", label: labels.all },
    { href: "/dashboard/donations", label: labels.donations },
    { href: "/dashboard/acts", label: labels.acts },
    { href: "/dashboard/projects", label: labels.openWork },
  ];

  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          className="rounded-lg border border-border-subtle bg-surface-offwhite px-4 py-2 text-sm text-muted transition-colors hover:text-primary"
          href={localizePath(locale, item.href)}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
