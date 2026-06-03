import Link from "next/link";
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

type SiteHeaderMessages = {
  nav: NavMessages;
  common: {
    anonymous: string;
    by: string;
    recordDonation: string;
    recordKindness: string;
    recordOpenWork: string;
  };
  search: {
    title: string;
    placeholder: string;
    loading: string;
    users: string;
    records: string;
    usersEmpty: string;
    recordsEmpty: string;
    empty: string;
    hint: string;
  };
};

export function SiteHeader({
  locale,
  messages,
  user,
}: {
  locale: Locale;
  messages: SiteHeaderMessages;
  user?: {
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
  } | null;
}) {
  const nav = [
    { href: "/explore", label: messages.nav.explore },
    { href: "/donate", label: messages.nav.donate },
    { href: "/about", label: messages.nav.about },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <div className="flex shrink-0 items-center gap-8">
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
        <div className="flex min-w-0 flex-1 items-center justify-end px-2 md:px-4">
          <SearchTrigger
            common={messages.common}
            label={messages.nav.search}
            locale={locale}
            search={messages.search}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            className="inline-flex h-9 min-w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface-offwhite px-3 font-sans text-sm font-medium text-primary transition-colors hover:border-primary/30 hover:bg-surface-container-low"
            href={localizePath(locale, "/new")}
          >
            {messages.nav.new}
          </Link>
          <LocaleSwitcher label={messages.nav.language} locale={locale} />
          {user ? (
            <AccountMenu
              labels={{
                signOut: messages.nav.signOut,
                dashboard: messages.nav.dashboard,
                profile: messages.nav.profile,
                settings: messages.nav.settings,
              }}
              locale={locale}
              user={user}
            />
          ) : (
            <Link
              className="text-sm font-medium text-primary transition-opacity hover:opacity-75"
              href={localizePath(locale, "/login")}
            >
              {messages.nav.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
