import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import type { Locale } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n";
import { AccountMenu } from "./account-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchTrigger } from "./search-trigger";

type NavMessages = {
  explore: string;
  donate: string;
  about: string;
  signIn: string;
  signOut: string;
  dashboard: string;
  new: string;
  profile: string;
  settings: string;
  language: string;
  search: string;
};

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
    username?: string | null;
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
        <div className="flex flex-1 items-center justify-end gap-4 md:justify-center md:px-6">
          <SearchTrigger label={messages.search} locale={locale} />
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/15"
            href={localizePath(locale, "/new")}
          >
            {messages.new}
          </Link>
          <LocaleSwitcher label={messages.language} locale={locale} />
          {user ? (
            <AccountMenu
              labels={{
                signOut: messages.signOut,
                dashboard: messages.dashboard,
                profile: messages.profile,
                settings: messages.settings,
              }}
              locale={locale}
              user={user}
            />
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
