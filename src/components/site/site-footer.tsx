import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";

type FooterMessages = {
  brand: string;
  tagline: string;
  github: string;
  privacy: string;
  terms: string;
};

export function SiteFooter({
  locale,
  messages,
}: {
  locale: Locale;
  messages: FooterMessages;
}) {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface-offwhite py-10">
      <div className="container-page flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="text-xs font-medium uppercase tracking-widest text-primary">
          © 2026 {messages.brand}. {messages.tagline}
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted">
          <a className="transition-colors hover:text-primary" href="https://github.com/CurtisYan/Curvio" rel="noreferrer" target="_blank">
            {messages.github}
          </a>
          <Link className="transition-colors hover:text-primary" href={localizePath(locale, "/privacy")}>
            {messages.privacy}
          </Link>
          <Link className="transition-colors hover:text-primary" href={localizePath(locale, "/terms")}>
            {messages.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
