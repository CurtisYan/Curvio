import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { LocaleSwitcher } from "./locale-switcher";

type NavMessages = {
  explore: string;
  donate: string;
  about: string;
  signIn: string;
  signOut: string;
  dashboard: string;
  new: string;
  settings: string;
  language: string;
};

function initialsFrom(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export function SiteHeader({
  locale,
  messages,
  user,
}: {
  locale: Locale;
  messages: NavMessages;
  user?: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}) {
  const nav = [
    { href: "/explore", label: messages.explore },
    { href: "/donate", label: messages.donate },
    { href: "/about", label: messages.about },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            className="font-sans text-2xl font-medium text-primary"
            href={localizePath(locale)}
          >
            Curvio
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                className="text-sm text-muted transition-colors hover:text-primary"
                href={localizePath(locale, item.href)}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LocaleSwitcher label={messages.language} locale={locale} />
          {user ? (
            <details className="group relative">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-border-subtle bg-surface-container-low text-xs font-semibold uppercase text-primary transition-colors hover:border-primary/50">
                {user.avatarUrl ? (
                  <img
                    alt={user.displayName ?? user.email ?? "User"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={user.avatarUrl}
                  />
                ) : (
                  initialsFrom(user.displayName ?? user.email ?? "User")
                )}
              </summary>
              <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <Link
                  className="block px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                  href={localizePath(locale, "/dashboard/new")}
                >
                  {messages.new}
                </Link>
                <Link
                  className="block px-4 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                  href={localizePath(locale, "/dashboard/settings")}
                >
                  {messages.settings}
                </Link>
                <div className="border-t border-border-subtle" />
                <form action={signOutAction}>
                  <input name="locale" type="hidden" value={locale} />
                  <button
                    className="block w-full px-4 py-2.5 text-left text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                    type="submit"
                  >
                    {messages.signOut}
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <Link
              className="text-sm font-medium text-primary transition-opacity hover:opacity-75"
              href={localizePath(locale, "/login")}
            >
              {messages.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
