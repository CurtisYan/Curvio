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
    records: string;
    projects: string;
  };
}) {
  const items = [
    { href: "/dashboard", label: labels.all },
    { href: "/dashboard/records", label: labels.records },
    { href: "/dashboard/projects", label: labels.projects },
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
